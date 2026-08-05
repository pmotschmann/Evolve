// WebGL backend for the solar map.
//
// This is an implementation of the Canvas 2D map that is drawn using WebGL using the same
// drawMap and its helpers that the Canvas implementation uses, drawn through WebGL instead of the browser's 2D
// rasteriser — so one drawMap serves both renderers and there is no second drawing routine to keep in sync.

const VERT_SRC = `
attribute vec2 a_pos;
attribute vec2 a_uv;
attribute vec4 a_color;
attribute float a_mode;
attribute float a_aux;
uniform vec2 u_res;
varying vec2 v_uv;
varying vec4 v_color;
varying float v_mode;
varying float v_aux;
void main(){
    v_uv = a_uv;
    v_color = a_color;
    v_mode = a_mode;
    v_aux = a_aux;
    vec2 p = a_pos / u_res * 2.0 - 1.0;
    gl_Position = vec4(p.x, -p.y, 0.0, 1.0);
}`;

// Coverage is worked out in device pixels, so the varyings carry pixel distances rather than
// normalised ones and want the extra range; highp where the hardware has it.
const FRAG_SRC = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
varying vec2 v_uv;
varying vec4 v_color;
varying float v_mode;
varying float v_aux;
uniform sampler2D u_tex;
void main(){
    vec4 c = v_color;
    if (v_mode > 2.5){
        // Disc: v_uv is the offset from the centre normalised by the radius, v_aux the radius in
        // device pixels. Coverage falls off over the outermost pixel, which is what the 2D
        // rasteriser's antialiasing amounts to, and a sub-pixel body fades instead of popping.
        float d = length(v_uv) * v_aux;
        c.a *= clamp(v_aux - d + 0.5, 0.0, 1.0);
    }
    else if (v_mode > 1.5){
        // Stroke: v_uv.x is the signed distance from the centreline in device pixels, v_aux the
        // half width. A line thinner than a pixel comes out faint rather than vanishing, the same
        // way a hairline does in 2D.
        c.a *= clamp(v_aux - abs(v_uv.x) + 0.5, 0.0, 1.0);
    }
    else if (v_mode > 0.5){
        c *= texture2D(u_tex, v_uv);
    }
    if (c.a <= 0.0){ discard; }
    gl_FragColor = c;
}`;

const MODE_SOLID = 0;
const MODE_TEX = 1;
const MODE_LINE = 2;
const MODE_DISC = 3;

const FLOATS_PER_VERT = 10;
// Vertices held before a flush. Large enough that an ordinary frame is a handful of draw calls,
// small enough that the buffer stays a couple of megabytes.
const BATCH_VERTS = 49152;

// Width of the antialiased edge, in device pixels.
const FEATHER = 1.0;

// A dash pattern finer than this on screen is drawn as a solid line at the pattern's duty cycle
// instead. Below a pixel a dash and its gap both land inside the same pixel, so the rasteriser is
// already averaging them into exactly that — and the belt orbits use a 0.01-unit pattern, which
// zoomed out would otherwise mean tens of thousands of quads for a line that reads as solid.
const DASH_MIN_PX = 1.5;

// Rendered labels held in the texture cache. Map labels are drawn from a small, stable set (planet,
// star and ship names, gate glyphs), so this is far more than a frame needs and the cache settles.
const TEXT_CACHE_MAX = 512;

// --- small helpers ------------------------------------------------------------------------------

// Canvas accepts '#rgb', '#rrggbb', 'rgb(...)', 'rgba(...)' and the named colours; the map uses the
// first four plus 'transparent'. Returns [r,g,b,a] with components in 0..1.
const namedColors = { transparent: [0,0,0,0], black: [0,0,0,1], white: [1,1,1,1] };
const colorCache = {};
function parseColor(css){
    if (typeof css !== 'string'){ return [0,0,0,1]; }
    if (colorCache[css]){ return colorCache[css]; }
    let out = [0,0,0,1];
    let s = css.trim().toLowerCase();
    if (namedColors[s]){ out = namedColors[s].slice(); }
    else if (s.charAt(0) === '#'){
        let h = s.substring(1);
        if (h.length === 3){ h = h.charAt(0)+h.charAt(0)+h.charAt(1)+h.charAt(1)+h.charAt(2)+h.charAt(2); }
        let n = parseInt(h.substring(0,6), 16);
        out = [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255, 1];
        if (h.length === 8){ out[3] = parseInt(h.substring(6,8), 16) / 255; }
    }
    else if (s.substring(0,3) === 'rgb'){
        let parts = s.substring(s.indexOf('(') + 1, s.lastIndexOf(')')).split(',');
        out = [
            Math.min(255, parseFloat(parts[0]) || 0) / 255,
            Math.min(255, parseFloat(parts[1]) || 0) / 255,
            Math.min(255, parseFloat(parts[2]) || 0) / 255,
            parts.length > 3 ? Math.max(0, Math.min(1, parseFloat(parts[3]) || 0)) : 1
        ];
    }
    colorCache[css] = out;
    return out;
}

// A gradient, as returned by createLinearGradient/createRadialGradient. Colours are resolved per
// vertex at paint time from the vertex's position in user space, which is the space canvas defines
// a gradient in — so the gate's sheen runs across the ring exactly as it does in 2D.
class Gradient {
    constructor(type, coords){
        this.type = type;
        this.c = coords;
        this.stops = [];
    }
    addColorStop(offset, color){
        this.stops.push({ o: offset, c: parseColor(color) });
        this.stops.sort((a,b) => a.o - b.o);
    }
    // Colour at a point in the user space the gradient was created in.
    at(x, y){
        if (this.stops.length === 0){ return [0,0,0,0]; }
        let t;
        if (this.type === 'linear'){
            let [x0,y0,x1,y1] = this.c;
            let dx = x1 - x0, dy = y1 - y0;
            let len2 = dx*dx + dy*dy;
            t = len2 > 0 ? ((x - x0) * dx + (y - y0) * dy) / len2 : 0;
        }
        else {
            // Radial, treated as the distance from the inner circle's centre between the two radii.
            // The map only uses radial gradients on its offscreen texture canvases, which are real
            // 2D contexts; this is here so a gradient assigned to fillStyle can't come out blank.
            let [x0,y0,r0,,,r1] = this.c;
            let d = Math.hypot(x - x0, y - y0);
            t = r1 !== r0 ? (d - r0) / (r1 - r0) : 0;
        }
        t = Math.max(0, Math.min(1, t));
        let stops = this.stops;
        if (t <= stops[0].o){ return stops[0].c; }
        if (t >= stops[stops.length - 1].o){ return stops[stops.length - 1].c; }
        for (let i = 1; i < stops.length; i++){
            if (t <= stops[i].o){
                let a = stops[i-1], b = stops[i];
                let f = b.o === a.o ? 0 : (t - a.o) / (b.o - a.o);
                return [
                    a.c[0] + (b.c[0] - a.c[0]) * f,
                    a.c[1] + (b.c[1] - a.c[1]) * f,
                    a.c[2] + (b.c[2] - a.c[2]) * f,
                    a.c[3] + (b.c[3] - a.c[3]) * f
                ];
            }
        }
        return stops[stops.length - 1].c;
    }
}

// One scratch 2D canvas, shared, for measuring and rasterising text.
let scratch = false;
function scratchCtx(){
    if (!scratch){
        let c = document.createElement('canvas');
        c.width = c.height = 64;
        scratch = c.getContext('2d');
    }
    return scratch;
}

// Font strings on the map are all `<size>px <family>`. Rescaling one lets a label be rasterised at
// the size it will actually occupy on screen rather than at its nominal size and then resampled.
function scaleFont(font, k){
    return font.replace(/(\d*\.?\d+)px/, (m, n) => `${parseFloat(n) * k}px`);
}

// Rasterisation scale for a label, quantised so that a label does not get a fresh texture for every
// pixel of zoom. In practice the map draws its text with a net transform of 1 (it undoes the map
// scale first), so this lands on 1 and every label is rasterised once.
function quantScale(s){
    if (!(s > 0)){ return 1; }
    let q = Math.pow(2, Math.round(Math.log2(s)));
    return Math.max(0.125, Math.min(4, q));
}

// --- the context --------------------------------------------------------------------------------

class GLContext {
    constructor(gl, canvas){
        this.gl = gl;
        this.canvas = canvas;
        this.lost = false;

        this.prog = this._program(VERT_SRC, FRAG_SRC);
        gl.useProgram(this.prog);
        this.loc = {
            pos: gl.getAttribLocation(this.prog, 'a_pos'),
            uv: gl.getAttribLocation(this.prog, 'a_uv'),
            color: gl.getAttribLocation(this.prog, 'a_color'),
            mode: gl.getAttribLocation(this.prog, 'a_mode'),
            aux: gl.getAttribLocation(this.prog, 'a_aux'),
            res: gl.getUniformLocation(this.prog, 'u_res'),
            tex: gl.getUniformLocation(this.prog, 'u_tex')
        };
        gl.uniform1i(this.loc.tex, 0);

        this.buf = gl.createBuffer();
        this.data = new Float32Array(BATCH_VERTS * FLOATS_PER_VERT);
        this.count = 0;

        // Bound whenever a batch has no image in it, so the sampler always has something valid.
        this.blank = this._blankTexture();
        this.batchTex = this.blank;
        // Textures for the map's cached body/star canvases. Weak, so a texture cannot outlive the
        // canvas it came from.
        this.imgTex = new WeakMap();
        // Rasterised labels, in insertion order so the oldest can be dropped first.
        this.textCache = new Map();

        gl.disable(gl.DEPTH_TEST);
        gl.disable(gl.CULL_FACE);
        gl.enable(gl.BLEND);
        gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

        this.reset();

        // A lost context leaves every object above invalid. Drawing is skipped until the browser
        // gives it back, at which point everything is rebuilt from scratch and the map repainted.
        this.onLost = (e) => { e.preventDefault(); this.lost = true; };
        this.onRestored = () => { this.lost = false; this._rebuild(); if (this.redraw){ this.redraw(); } };
        canvas.addEventListener('webglcontextlost', this.onLost, false);
        canvas.addEventListener('webglcontextrestored', this.onRestored, false);
    }

    // --- setup ---

    _program(vs, fs){
        let gl = this.gl;
        let compile = (type, src) => {
            let s = gl.createShader(type);
            gl.shaderSource(s, src);
            gl.compileShader(s);
            if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)){
                let log = gl.getShaderInfoLog(s);
                gl.deleteShader(s);
                throw new Error(`solar map shader: ${log}`);
            }
            return s;
        };
        let v = compile(gl.VERTEX_SHADER, vs);
        let f = compile(gl.FRAGMENT_SHADER, fs);
        let p = gl.createProgram();
        gl.attachShader(p, v);
        gl.attachShader(p, f);
        gl.linkProgram(p);
        gl.deleteShader(v);
        gl.deleteShader(f);
        if (!gl.getProgramParameter(p, gl.LINK_STATUS)){
            let log = gl.getProgramInfoLog(p);
            gl.deleteProgram(p);
            throw new Error(`solar map program: ${log}`);
        }
        return p;
    }

    _blankTexture(){
        let gl = this.gl;
        let t = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, t);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255,255,255,255]));
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        return t;
    }

    _rebuild(){
        this.prog = this._program(VERT_SRC, FRAG_SRC);
        this.gl.useProgram(this.prog);
        this.buf = this.gl.createBuffer();
        this.blank = this._blankTexture();
        this.batchTex = this.blank;
        this.imgTex = new WeakMap();
        this.textCache = new Map();
        this.count = 0;
    }

    // --- state ---

    reset(){
        this.m = [1,0,0,1,0,0];
        this.stack = [];
        this.fillStyle = '#000000';
        this.strokeStyle = '#000000';
        this.lineWidth = 1;
        this.dash = [];
        this.font = '10px sans-serif';
        this.textAlign = 'start';
        this.textBaseline = 'alphabetic';
        this.shadowColor = 'rgba(0, 0, 0, 0)';
        this.shadowOffsetX = 0;
        this.shadowOffsetY = 0;
        this.shadowBlur = 0;
        this.path = [];
        this.sub = false;
    }

    save(){
        this.stack.push({
            m: this.m.slice(),
            fillStyle: this.fillStyle, strokeStyle: this.strokeStyle,
            lineWidth: this.lineWidth, dash: this.dash.slice(),
            font: this.font, textAlign: this.textAlign, textBaseline: this.textBaseline,
            shadowColor: this.shadowColor, shadowOffsetX: this.shadowOffsetX,
            shadowOffsetY: this.shadowOffsetY, shadowBlur: this.shadowBlur
        });
    }

    restore(){
        let s = this.stack.pop();
        if (!s){ return; }
        this.m = s.m;
        this.fillStyle = s.fillStyle; this.strokeStyle = s.strokeStyle;
        this.lineWidth = s.lineWidth; this.dash = s.dash;
        this.font = s.font; this.textAlign = s.textAlign; this.textBaseline = s.textBaseline;
        this.shadowColor = s.shadowColor; this.shadowOffsetX = s.shadowOffsetX;
        this.shadowOffsetY = s.shadowOffsetY; this.shadowBlur = s.shadowBlur;
    }

    setTransform(a,b,c,d,e,f){ this.m = [a,b,c,d,e,f]; }

    translate(x, y){
        let m = this.m;
        m[4] += m[0] * x + m[2] * y;
        m[5] += m[1] * x + m[3] * y;
    }

    scale(sx, sy){
        let m = this.m;
        m[0] *= sx; m[1] *= sx;
        m[2] *= sy; m[3] *= sy;
    }

    rotate(r){
        let m = this.m;
        let c = Math.cos(r), s = Math.sin(r);
        let a0 = m[0], b0 = m[1], c0 = m[2], d0 = m[3];
        m[0] = a0 * c + c0 * s;
        m[1] = b0 * c + d0 * s;
        m[2] = c0 * c - a0 * s;
        m[3] = d0 * c - b0 * s;
    }

    setLineDash(d){ this.dash = (d || []).slice(); }
    getLineDash(){ return this.dash.slice(); }

    createLinearGradient(x0,y0,x1,y1){ return new Gradient('linear', [x0,y0,x1,y1]); }
    createRadialGradient(x0,y0,r0,x1,y1,r1){ return new Gradient('radial', [x0,y0,r0,x1,y1,r1]); }

    // Device-space scale of the current transform. The map only ever scales uniformly, so one number
    // describes it and stroke widths, glyph sizes and antialiasing can all be worked out from it.
    _scale(){
        let m = this.m;
        let det = Math.abs(m[0] * m[3] - m[1] * m[2]);
        return Math.sqrt(det) || 1e-6;
    }

    _tx(x, y){ return this.m[0] * x + this.m[2] * y + this.m[4]; }
    _ty(x, y){ return this.m[1] * x + this.m[3] * y + this.m[5]; }

    // --- paths ---

    beginPath(){
        this.path = [];
        this.sub = false;
    }

    _newSub(x, y){
        this.sub = { pts: [x, y], closed: false, circle: false };
        this.path.push(this.sub);
        return this.sub;
    }

    moveTo(x, y){ this._newSub(x, y); }

    lineTo(x, y){
        if (!this.sub){ this._newSub(x, y); return; }
        this.sub.pts.push(x, y);
        this.sub.circle = false;   // no longer a bare circle, so it loses the analytic fast path
    }

    closePath(){
        if (this.sub){ this.sub.closed = true; }
    }

    // Arcs are tessellated at a step chosen from their on-screen size, so a small one costs little
    // and a large one stays round. A whole circle drawn on its own also records its centre and
    // radius, which lets fill() lay it down as an analytically antialiased disc — which is what
    // almost every body on the map is.
    arc(x, y, r, start, end, anticlockwise){
        let full = Math.abs((end - start) - (anticlockwise ? -Math.PI * 2 : Math.PI * 2)) < 1e-9
                || Math.abs(end - start) >= Math.PI * 2 - 1e-9;
        let rpx = Math.max(0.5, r * this._scale());
        let steps = Math.max(12, Math.min(256, Math.ceil(rpx * 0.9)));
        let sweep;
        if (full){ sweep = anticlockwise ? -Math.PI * 2 : Math.PI * 2; }
        else {
            sweep = end - start;
            if (anticlockwise && sweep > 0){ sweep -= Math.PI * 2; }
            else if (!anticlockwise && sweep < 0){ sweep += Math.PI * 2; }
            steps = Math.max(3, Math.ceil(steps * Math.abs(sweep) / (Math.PI * 2)));
        }
        let fresh = !this.sub || this.sub.pts.length === 0;
        let sub = fresh ? this._newSub(x + Math.cos(start) * r, y + Math.sin(start) * r) : this.sub;
        for (let i = 1; i <= steps; i++){
            let a = start + sweep * (i / steps);
            sub.pts.push(x + Math.cos(a) * r, y + Math.sin(a) * r);
        }
        if (full){
            sub.closed = true;
            // The tessellation ends back on its start point; drop the duplicate so the closed-path
            // join logic does not see a zero-length segment.
            sub.pts.length -= 2;
            if (fresh){ sub.circle = { x, y, r }; }
        }
    }

    fill(){
        for (let sub of this.path){
            if (sub.circle){ this._disc(sub.circle.x, sub.circle.y, sub.circle.r, this.fillStyle); }
            else if (sub.pts.length >= 6){ this._fan(sub.pts, this.fillStyle); }
        }
    }

    stroke(){
        for (let sub of this.path){
            this._strokeSub(sub);
        }
    }

    fillRect(x, y, w, h){
        this._fan([x, y, x + w, y, x + w, y + h, x, y + h], this.fillStyle);
    }

    // --- geometry emission ---

    // A filled circle, antialiased in the fragment shader rather than by tessellation, so it stays
    // smooth at any size and a body smaller than a pixel fades out instead of flickering.
    _disc(cx, cy, r, style){
        if (!(r > 0)){ return; }   // canvas draws nothing for a zero-radius arc
        let s = this._scale();
        let R = r * s;
        // Grow the quad by the feather so the falloff has somewhere to live, and express the corner
        // in units of the radius, which is what the shader expects.
        let pad = r + FEATHER / s;
        let e = pad / r;
        let col = style instanceof Gradient ? false : parseColor(style);
        let quad = [ -pad, -pad, pad, -pad, pad, pad, -pad, pad ];
        let uv = [ -e, -e, e, -e, e, e, -e, e ];
        this._reserve(6);
        let order = [0, 1, 2, 0, 2, 3];
        for (let k of order){
            let px = cx + quad[k * 2], py = cy + quad[k * 2 + 1];
            let c = col || style.at(px, py);
            this._vert(this._tx(px, py), this._ty(px, py), uv[k * 2], uv[k * 2 + 1], c, MODE_DISC, R);
        }
    }

    // Convex polygon as a triangle fan. Every path the map fills other than a circle is convex (a
    // rectangle, or an arc closed back to its centre), so a fan is exact.
    _fan(pts, style){
        let n = pts.length / 2;
        if (n < 3){ return; }
        let col = style instanceof Gradient ? false : parseColor(style);
        this._reserve((n - 2) * 3);
        for (let i = 1; i < n - 1; i++){
            for (let k of [0, i, i + 1]){
                let px = pts[k * 2], py = pts[k * 2 + 1];
                let c = col || style.at(px, py);
                this._vert(this._tx(px, py), this._ty(px, py), 0, 0, c, MODE_SOLID, 0);
            }
        }
    }

    _strokeSub(sub){
        let pts = sub.pts;
        if (pts.length < 4){
            // A degenerate subpath: canvas draws nothing for a butt-capped zero-length line.
            return;
        }
        let s = this._scale();
        let period = this.dash.length ? this.dash.reduce((a,b) => a + b, 0) : 0;
        if (period > 0 && period * s >= DASH_MIN_PX){
            for (let piece of this._dashPieces(pts, sub.closed)){
                this._polyline(piece, false, this.strokeStyle, 1);
            }
        }
        else if (period > 0){
            // Sub-pixel dashes: solid, at the pattern's duty cycle. See DASH_MIN_PX.
            let on = 0;
            for (let i = 0; i < this.dash.length; i += 2){ on += this.dash[i]; }
            // An odd-length pattern repeats with its parity flipped, so on time is half the total.
            let duty = this.dash.length % 2 ? 0.5 : on / period;
            this._polyline(pts, sub.closed, this.strokeStyle, duty);
        }
        else {
            this._polyline(pts, sub.closed, this.strokeStyle, 1);
        }
    }

    // Walk the polyline splitting it into the lit runs of the dash pattern. Lengths are in user
    // units, matching how canvas measures a dash.
    _dashPieces(pts, closed){
        let pattern = this.dash.slice();
        if (pattern.length % 2){ pattern = pattern.concat(pattern); }
        // A zero-length entry would consume no distance and spin the walk below forever. The map
        // never sets one, but a pattern arriving from anywhere else must not be able to hang a frame.
        let span = pattern.reduce((a,b) => a + b, 0);
        pattern = pattern.map(v => v > 0 ? v : span * 1e-4);
        let out = [];
        let idx = 0, left = pattern[0], on = true;
        let cur = on ? [pts[0], pts[1]] : false;
        let n = pts.length / 2;
        let last = closed ? n : n - 1;
        for (let i = 0; i < last; i++){
            let ax = pts[i * 2], ay = pts[i * 2 + 1];
            let j = (i + 1) % n;
            let bx = pts[j * 2], by = pts[j * 2 + 1];
            let seg = Math.hypot(bx - ax, by - ay);
            let done = 0;
            while (seg - done > left){
                done += left;
                let t = done / seg;
                let mx = ax + (bx - ax) * t, my = ay + (by - ay) * t;
                if (on){
                    cur.push(mx, my);
                    out.push(cur);
                    cur = false;
                }
                else {
                    cur = [mx, my];
                }
                on = !on;
                idx = (idx + 1) % pattern.length;
                left = pattern[idx];
            }
            left -= (seg - done);
            if (on && cur){ cur.push(bx, by); }
        }
        if (on && cur && cur.length >= 4){ out.push(cur); }
        return out;
    }

    // Stroke a polyline as a triangle strip with mitred joins. A strip rather than a quad per
    // segment because the map strokes translucent ring bands, and overlapping quads would blend
    // twice at every joint and bead the line.
    _polyline(pts, closed, style, alphaMul){
        let n = pts.length / 2;
        if (n < 2){ return; }
        let s = this._scale();
        let half = Math.max(this.lineWidth, 0) / 2;
        let H = half * s;                       // half width in device pixels
        let off = half + FEATHER / s;           // offset in user units, feather included
        let edge = H + FEATHER;                 // the distance the shader sees at the outer edge
        let col = style instanceof Gradient ? false : parseColor(style);
        if (col && alphaMul !== 1){ col = [col[0], col[1], col[2], col[3] * alphaMul]; }

        // Offset direction at each vertex: the segment normal at an end, the mitre between the two
        // segments at a joint. A mitre longer than the limit falls back to the segment normal,
        // which bevels the corner rather than letting a near-reversal shoot off to infinity.
        const MITRE_LIMIT = 6;
        let count = closed ? n + 1 : n;
        let vx = new Float64Array(count * 2);
        let ends = new Float64Array(count * 2);
        for (let i = 0; i < count; i++){
            let k = i % n;
            let x = pts[k * 2], y = pts[k * 2 + 1];
            let prev = closed ? (k - 1 + n) % n : k - 1;
            let next = closed ? (k + 1) % n : k + 1;
            let n1 = false, n2 = false;
            if (prev >= 0){
                let dx = x - pts[prev * 2], dy = y - pts[prev * 2 + 1];
                let l = Math.hypot(dx, dy);
                if (l > 0){ n1 = [-dy / l, dx / l]; }
            }
            if (next < n || closed){
                let dx = pts[next * 2] - x, dy = pts[next * 2 + 1] - y;
                let l = Math.hypot(dx, dy);
                if (l > 0){ n2 = [-dy / l, dx / l]; }
            }
            let dir, scale = 1;
            if (n1 && n2){
                let mx = n1[0] + n2[0], my = n1[1] + n2[1];
                let l = Math.hypot(mx, my);
                if (l > 1e-6){
                    mx /= l; my /= l;
                    let d = mx * n2[0] + my * n2[1];
                    scale = d > 1e-6 ? 1 / d : MITRE_LIMIT;
                    if (scale > MITRE_LIMIT){ dir = n2; scale = 1; }
                    else { dir = [mx, my]; }
                }
                else { dir = n2; }
            }
            else { dir = n1 || n2 || [0, 0]; }
            vx[i * 2] = x; vx[i * 2 + 1] = y;
            ends[i * 2] = dir[0] * scale; ends[i * 2 + 1] = dir[1] * scale;
        }

        this._reserve((count - 1) * 6);
        for (let i = 0; i < count - 1; i++){
            let ax = vx[i * 2], ay = vx[i * 2 + 1];
            let bx = vx[(i+1) * 2], by = vx[(i+1) * 2 + 1];
            let an = [ends[i * 2], ends[i * 2 + 1]];
            let bn = [ends[(i+1) * 2], ends[(i+1) * 2 + 1]];
            // Corners: a-left, a-right, b-right, b-left.
            let cx = [ax + an[0] * off, ax - an[0] * off, bx - bn[0] * off, bx + bn[0] * off];
            let cy = [ay + an[1] * off, ay - an[1] * off, by - bn[1] * off, by + bn[1] * off];
            let du = [edge, -edge, -edge, edge];
            for (let k of [0, 1, 2, 0, 2, 3]){
                let c = col || style.at(cx[k], cy[k]);
                if (!col && alphaMul !== 1){ c = [c[0], c[1], c[2], c[3] * alphaMul]; }
                this._vert(this._tx(cx[k], cy[k]), this._ty(cx[k], cy[k]), du[k], 0, c, MODE_LINE, H);
            }
        }
    }

    // --- images ---

    _texture(src){
        let gl = this.gl;
        let t = this.imgTex.get(src);
        if (t){ return t; }
        // Uploading binds the new texture, which would otherwise leave whatever is already batched
        // to be drawn with it. Draw that first, then let the next _useTex rebind from scratch.
        this.flush();
        t = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, t);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        // Body textures are 128 and 256 square and get drawn at anything from a couple of pixels to
        // most of the screen. Without mipmaps the zoomed-out case samples a handful of texels out of
        // 65536 and boils; the 2D renderer's own downsampling is what this matches.
        let pot = (src.width & (src.width - 1)) === 0 && (src.height & (src.height - 1)) === 0;
        if (pot){
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        }
        else {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }
        this.imgTex.set(src, t);
        // A body texture is generated once and never repainted, so it is uploaded once and kept.
        this.batchTex = false;
        return t;
    }

    drawImage(src, dx, dy, dw, dh){
        if (dw === undefined){ dw = src.width; dh = src.height; }
        this._quad(this._texture(src), dx, dy, dw, dh, [1,1,1,1]);
    }

    _quad(tex, dx, dy, dw, dh, color){
        this._useTex(tex);
        this._reserve(6);
        let px = [dx, dx + dw, dx + dw, dx];
        let py = [dy, dy, dy + dh, dy + dh];
        let u = [0, 1, 1, 0], v = [0, 0, 1, 1];
        for (let k of [0, 1, 2, 0, 2, 3]){
            this._vert(this._tx(px[k], py[k]), this._ty(px[k], py[k]), u[k], v[k], color, MODE_TEX, 0);
        }
    }

    // --- text ---

    measureText(text){
        let x = scratchCtx();
        x.font = this.font;
        return x.measureText(text);
    }

    // Labels are rasterised by the browser's own 2D text engine — glyph shapes, hinting, colour
    // emoji and the drop shadow included — into a cached texture, then drawn as a quad. The colour
    // is baked in and the quad drawn white, so an emoji keeps its own colours instead of being
    // tinted by fillStyle, exactly as it is in 2D.
    fillText(text, x, y){
        if (text === undefined || text === null || text === ''){ return; }
        text = String(text);
        let s = this._scale();
        let q = quantScale(s);
        let shadow = parseColor(this.shadowColor);
        let hasShadow = shadow[3] > 0 && (this.shadowBlur > 0 || this.shadowOffsetX !== 0 || this.shadowOffsetY !== 0);
        let fill = this.fillStyle instanceof Gradient ? 'rgba(255,255,255,1)' : this.fillStyle;
        let key = `${text}|${this.font}|${fill}|${this.textAlign}|${this.textBaseline}|${q}|`
                + (hasShadow ? `${this.shadowColor}:${this.shadowOffsetX}:${this.shadowOffsetY}:${this.shadowBlur}` : '');
        let entry = this.textCache.get(key);
        if (!entry){
            entry = this._rasterText(text, fill, q, hasShadow);
            if (!entry){ return; }
            this.textCache.set(key, entry);
            if (this.textCache.size > TEXT_CACHE_MAX){
                let oldest = this.textCache.keys().next().value;
                let dead = this.textCache.get(oldest);
                this.textCache.delete(oldest);
                if (dead && dead.tex){ this.gl.deleteTexture(dead.tex); }
                if (this.batchTex === (dead && dead.tex)){ this.batchTex = false; }
            }
        }
        // The bitmap holds q device pixels per user unit, so its extent in user units is size/q.
        let ux = x + entry.ox / q, uy = y + entry.oy / q;
        // A bitmap sampled at a fractional offset comes out soft. Every label the map draws sits
        // under a plain translate-and-scale, and there the quad is placed in device space and
        // snapped to the pixel grid — with the usual net scale of 1 the texture then maps one to one
        // and the glyphs land on exactly the pixels the 2D renderer would have used. A rotated
        // transform (the gate's engraved glyphs) has no grid to snap to and goes through as normal.
        if (Math.abs(this.m[1]) < 1e-9 && Math.abs(this.m[2]) < 1e-9){
            let k = s / q;
            this._quadDev(entry.tex, Math.round(this._tx(ux, uy)), Math.round(this._ty(ux, uy)),
                entry.w * k, entry.h * k);
        }
        else {
            this._quad(entry.tex, ux, uy, entry.w / q, entry.h / q, [1,1,1,1]);
        }
    }

    // A textured quad already in device pixels, bypassing the transform.
    _quadDev(tex, dx, dy, dw, dh){
        this._useTex(tex);
        this._reserve(6);
        let px = [dx, dx + dw, dx + dw, dx];
        let py = [dy, dy, dy + dh, dy + dh];
        let u = [0, 1, 1, 0], v = [0, 0, 1, 1];
        let white = [1,1,1,1];
        for (let k of [0, 1, 2, 0, 2, 3]){
            this._vert(px[k], py[k], u[k], v[k], white, MODE_TEX, 0);
        }
    }

    // Draw one label into an offscreen canvas and upload it. Returns the texture together with the
    // bitmap's placement relative to the text anchor, so fillText can put the quad exactly where
    // the 2D renderer would have put the glyphs.
    _rasterText(text, fill, q, hasShadow){
        let x = scratchCtx();
        let font = scaleFont(this.font, q);
        x.font = font;
        x.textAlign = this.textAlign;
        x.textBaseline = this.textBaseline;
        let m = x.measureText(text);
        // The ink box relative to the anchor, which already accounts for align and baseline. Older
        // engines without the actualBoundingBox metrics fall back to the advance width and the font
        // size, which is generous but never clips.
        let size = parseFloat(font) || 10;
        let left, right, top, bottom;
        if (m.actualBoundingBoxLeft !== undefined && m.actualBoundingBoxAscent !== undefined){
            left = -m.actualBoundingBoxLeft;
            right = m.actualBoundingBoxRight;
            top = -m.actualBoundingBoxAscent;
            bottom = m.actualBoundingBoxDescent;
        }
        else {
            let w = m.width;
            let alignShift = this.textAlign === 'center' ? -w / 2
                           : (this.textAlign === 'right' || this.textAlign === 'end') ? -w : 0;
            let baseShift = this.textBaseline === 'middle' ? -size * 0.5
                          : this.textBaseline === 'top' || this.textBaseline === 'hanging' ? 0
                          : this.textBaseline === 'bottom' ? -size : -size * 0.8;
            left = alignShift; right = alignShift + w;
            top = baseShift; bottom = baseShift + size * 1.25;
        }
        // Room for the shadow: its offset plus the blur's reach on either side.
        let blur = hasShadow ? this.shadowBlur * q : 0;
        let ox = hasShadow ? this.shadowOffsetX * q : 0;
        let oy = hasShadow ? this.shadowOffsetY * q : 0;
        let padL = Math.ceil(blur * 1.5 + Math.max(0, -ox) + 2);
        let padR = Math.ceil(blur * 1.5 + Math.max(0, ox) + 2);
        let padT = Math.ceil(blur * 1.5 + Math.max(0, -oy) + 2);
        let padB = Math.ceil(blur * 1.5 + Math.max(0, oy) + 2);
        let w = Math.ceil(right - left) + padL + padR;
        let h = Math.ceil(bottom - top) + padT + padB;
        if (!(w > 0) || !(h > 0)){ return false; }
        // A single label is small; anything absurd is a sign the metrics went wrong, and a texture
        // that size would be a far worse failure than a missing name.
        if (w > 2048 || h > 2048){ return false; }

        let c = document.createElement('canvas');
        c.width = w;
        c.height = h;
        let g = c.getContext('2d');
        g.font = font;
        g.textAlign = this.textAlign;
        g.textBaseline = this.textBaseline;
        g.fillStyle = fill;
        if (hasShadow){
            g.shadowColor = this.shadowColor;
            g.shadowOffsetX = ox;
            g.shadowOffsetY = oy;
            g.shadowBlur = blur;
        }
        // Put the anchor where the ink box lands inside the padding.
        g.fillText(text, padL - left, padT - top);

        // As in _texture: flush before the upload rebinds, or the batch is drawn with the label.
        this.flush();
        let gl = this.gl;
        let tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        this.batchTex = false;
        return { tex, w, h, ox: left - padL, oy: top - padT };
    }

    // --- batching ---

    _useTex(tex){
        if (this.batchTex !== tex){
            this.flush();
            this.batchTex = tex;
        }
    }

    _reserve(verts){
        if (this.count + verts > BATCH_VERTS){
            let tex = this.batchTex;
            this.flush();
            this.batchTex = tex;
        }
    }

    _vert(x, y, u, v, c, mode, aux){
        let d = this.data, i = this.count * FLOATS_PER_VERT;
        d[i] = x; d[i+1] = y;
        d[i+2] = u; d[i+3] = v;
        d[i+4] = c[0]; d[i+5] = c[1]; d[i+6] = c[2]; d[i+7] = c[3];
        d[i+8] = mode; d[i+9] = aux;
        this.count++;
    }

    flush(){
        if (this.count === 0 || this.lost){ this.count = 0; return; }
        let gl = this.gl;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buf);
        gl.bufferData(gl.ARRAY_BUFFER, this.data.subarray(0, this.count * FLOATS_PER_VERT), gl.STREAM_DRAW);
        let stride = FLOATS_PER_VERT * 4;
        let l = this.loc;
        gl.enableVertexAttribArray(l.pos);
        gl.vertexAttribPointer(l.pos, 2, gl.FLOAT, false, stride, 0);
        gl.enableVertexAttribArray(l.uv);
        gl.vertexAttribPointer(l.uv, 2, gl.FLOAT, false, stride, 8);
        gl.enableVertexAttribArray(l.color);
        gl.vertexAttribPointer(l.color, 4, gl.FLOAT, false, stride, 16);
        gl.enableVertexAttribArray(l.mode);
        gl.vertexAttribPointer(l.mode, 1, gl.FLOAT, false, stride, 32);
        gl.enableVertexAttribArray(l.aux);
        gl.vertexAttribPointer(l.aux, 1, gl.FLOAT, false, stride, 36);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.batchTex || this.blank);
        gl.drawArrays(gl.TRIANGLES, 0, this.count);
        this.count = 0;
    }

    // --- frame ---

    beginFrame(){
        if (this.lost){ return; }
        let gl = this.gl;
        gl.useProgram(this.prog);
        gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        gl.uniform2f(this.loc.res, this.canvas.width, this.canvas.height);
        gl.uniform1i(this.loc.tex, 0);
        gl.disable(gl.DEPTH_TEST);
        gl.disable(gl.CULL_FACE);
        gl.enable(gl.BLEND);
        gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
        this.count = 0;
        this.batchTex = this.blank;
        this.reset();
    }

    endFrame(){
        if (this.lost){ return; }
        this.flush();
    }

    // Give the context back rather than waiting for the canvas to be collected. Closing and
    // reopening the map builds a new canvas each time, and a browser only keeps a handful of live
    // WebGL contexts before it starts dropping the oldest — releasing ours as it is replaced keeps
    // the map well clear of that limit however many times it is opened.
    destroy(){
        this.canvas.removeEventListener('webglcontextlost', this.onLost);
        this.canvas.removeEventListener('webglcontextrestored', this.onRestored);
        for (let entry of this.textCache.values()){
            if (entry && entry.tex){ this.gl.deleteTexture(entry.tex); }
        }
        this.textCache.clear();
        this.lost = true;
        let ext = this.gl.getExtension('WEBGL_lose_context');
        if (ext){ ext.loseContext(); }
    }
}

// Whether this browser can give the map a WebGL context at all. Probed on a throwaway canvas, so
// asking does not consume the map's own canvas — an element that has handed out one kind of context
// can never hand out another.
let glProbe = null;
export function webglSupported(){
    if (glProbe !== null){ return glProbe; }
    glProbe = false;
    try {
        let c = document.createElement('canvas');
        let gl = c.getContext('webgl') || c.getContext('experimental-webgl');
        glProbe = !!(gl && gl.getExtension);
        if (gl && gl.getExtension('WEBGL_lose_context')){
            gl.getExtension('WEBGL_lose_context').loseContext();
        }
    }
    catch (e){
        glProbe = false;
    }
    return glProbe;
}

// A WebGL-backed drawing context for `canvas`, or false if one cannot be had. `redraw` is called
// after a lost context is restored, since everything painted before it went is gone.
export function createGLContext(canvas, redraw){
    try {
        let gl = canvas.getContext('webgl', {
            alpha: false, antialias: true, depth: false, stencil: false,
            premultipliedAlpha: false, preserveDrawingBuffer: false
        }) || canvas.getContext('experimental-webgl', { alpha: false, antialias: true, depth: false });
        if (!gl){ return false; }
        let ctx = new GLContext(gl, canvas);
        ctx.redraw = redraw;
        return ctx;
    }
    catch (e){
        console.warn('solar map: WebGL unavailable, falling back to canvas', e);
        return false;
    }
}
