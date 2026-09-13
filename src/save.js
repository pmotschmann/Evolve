// Save serialization codec.
//
// Replaces LZ-String with raw DEFLATE (fflate), which is both smaller and  faster

const SENTINEL = '\u0000';   // impossible as the first char of a legacy localStorage save
const FORMAT_PLAIN = 1;      // DEFLATE(JSON)
const FORMAT_SHAPED = 2;     // DEFLATE(JSON of [shapes, body]) -- see shapeState below
const FORMAT_SHIPS = 3;      // FORMAT_SHAPED, plus in-transit ship positions rebuilt on load -- see packShips
const FORMATS = [FORMAT_PLAIN, FORMAT_SHAPED, FORMAT_SHIPS];
const EXPORT_PREFIX = { [FORMAT_PLAIN]: 'EvS1|', [FORMAT_SHAPED]: 'EvS2|', [FORMAT_SHIPS]: 'EvS3|' };
const CHAR_OFFSET = 32;      // keeps packed chars in the same safe range LZString uses
const DEFLATE_OPTS = { level: 6, mem: 12 };   // level >6 measured identical output on real saves

function codec(){
    return (typeof fflate !== 'undefined' && fflate && typeof fflate.deflateSync === 'function') ? fflate : null;
}

function legacy(){
    return (typeof LZString !== 'undefined' && LZString) ? LZString : null;
}

// --- 15-bits-per-UTF-16-char packing -------------------------------------------------
// localStorage bills per UTF-16 code unit (2 bytes), so packing 15 bits into each one costs
// ~1.07 bytes of quota per compressed byte. This is the same density trick compressToUTF16 uses.

function pack15(bytes){
    let out = '', acc = 0, bits = 0;
    for (let i = 0; i < bytes.length; i++){
        acc = (acc * 256) + bytes[i];
        bits += 8;
        while (bits >= 15){
            bits -= 15;
            const chunk = Math.floor(acc / Math.pow(2, bits));
            out += String.fromCharCode(chunk + CHAR_OFFSET);
            acc -= chunk * Math.pow(2, bits);
        }
    }
    if (bits > 0){
        out += String.fromCharCode((acc * Math.pow(2, 15 - bits)) + CHAR_OFFSET);
    }
    return out;
}

function unpack15(str, start, byteLen){
    const bytes = new Uint8Array(byteLen);
    let acc = 0, bits = 0, o = 0;
    for (let i = start; i < str.length && o < byteLen; i++){
        acc = (acc * 32768) + (str.charCodeAt(i) - CHAR_OFFSET);
        bits += 15;
        while (bits >= 8 && o < byteLen){
            bits -= 8;
            const chunk = Math.floor(acc / Math.pow(2, bits));
            bytes[o++] = chunk;
            acc -= chunk * Math.pow(2, bits);
        }
    }
    return bytes;
}

// --- base64 for the export string ----------------------------------------------------
// btoa/atob work on binary strings; chunked so a large save cannot blow the argument limit.

function bytesToB64(bytes){
    let bin = '';
    for (let i = 0; i < bytes.length; i += 0x8000){
        bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    }
    return btoa(bin);
}

function b64ToBytes(b64){
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++){ bytes[i] = bin.charCodeAt(i); }
    return bytes;
}

// --- lossless field pruning ----------------------------------------------------------
// Only fields the game rewrites on every load path are dropped, and the decoder puts
// a stand-in back so nothing downstream ever sees an absent key.

function pruneState(state){
    const out = {};
    for (const k in state){ out[k] = state[k]; }
    if (state.resource && typeof state.resource === 'object'){
        const res = {};
        for (const r in state.resource){
            const entry = state.resource[r];
            if (entry && typeof entry === 'object'){
                const copy = {};
                for (const f in entry){
                    if (f === 'name' || f === 'diff' || f === 'delta'){ continue; }
                    copy[f] = entry[f];
                }
                res[r] = copy;
            }
            else {
                res[r] = entry;
            }
        }
        out.resource = res;
    }
    return out;
}

function restoreState(state){
    if (state && state.resource && typeof state.resource === 'object'){
        for (const r in state.resource){
            const entry = state.resource[r];
            if (!entry || typeof entry !== 'object'){ continue; }
            if (!entry.hasOwnProperty('name')){ entry.name = r.replace(/_/g,' '); }
            if (!entry.hasOwnProperty('diff')){ entry.diff = 0; }
            if (!entry.hasOwnProperty('delta')){ entry.delta = 0; }
        }
    }
    return state;
}

// --- Shape-table codec ---------------------------------------------------------------
// Encode object keys once per shape; ARRAY_TAG preserves real arrays.
// Keep the legacy shaped format readable; serialization verifies compact formats before writing.

const ARRAY_TAG = -1;

function isOmitted(v){
    return v === undefined || typeof v === 'function' || typeof v === 'symbol';
}

function shapeState(root){
    const shapes = [], index = new Map();
    function enc(v, key){
        if (v !== null && typeof v === 'object' && typeof v.toJSON === 'function'){ v = v.toJSON(key); }
        if (v === null || typeof v !== 'object'){ return v; }
        if (Array.isArray(v)){
            const out = [ARRAY_TAG];
            for (let i = 0; i < v.length; i++){
                const x = enc(v[i], String(i));
                out.push(isOmitted(x) ? null : x);
            }
            return out;
        }
        const keys = [], out = [0];
        for (const k of Object.keys(v)){
            const x = enc(v[k], k);
            if (isOmitted(x)){ continue; }
            keys.push(k);
            out.push(x);
        }
        const sig = JSON.stringify(keys);
        let id = index.get(sig);
        if (id === undefined){
            id = shapes.length;
            shapes.push(keys);
            index.set(sig, id);
        }
        out[0] = id;
        return out;
    }
    return [shapes, enc(root, '')];
}

// Reject malformed shaped saves.
function unshapeState(packed){
    if (!Array.isArray(packed) || packed.length !== 2 || !Array.isArray(packed[0])){
        throw new Error('Corrupt save: missing shape table');
    }
    const shapes = packed[0];
    for (const keys of shapes){
        if (!Array.isArray(keys) || keys.some(k => typeof k !== 'string')){
            throw new Error('Corrupt save: malformed shape table');
        }
    }
    function dec(v){
        if (v === null || typeof v !== 'object'){ return v; }
        if (!Array.isArray(v) || v.length === 0){ throw new Error('Corrupt save: unexpected value in body'); }
        const tag = v[0];
        if (tag === ARRAY_TAG){
            const arr = new Array(v.length - 1);
            for (let i = 1; i < v.length; i++){ arr[i - 1] = dec(v[i]); }
            return arr;
        }
        const keys = Number.isInteger(tag) ? shapes[tag] : undefined;
        if (!keys || keys.length !== v.length - 1){ throw new Error('Corrupt save: bad shape reference'); }
        const o = {};
        for (let i = 0; i < keys.length; i++){
            const val = dec(v[i + 1]);
            if (keys[i] === '__proto__'){
                // Define __proto__ as data instead of changing the prototype.
                Object.defineProperty(o, '__proto__', { value: val, writable: true, enumerable: true, configurable: true });
            }
            else {
                o[keys[i]] = val;
            }
        }
        return o;
    }
    return dec(packed[1]);
}

// --- In-transit ship positions -------------------------------------------------------
// Pack positions reconstructed from a ship's current leg; retain all other stored positions.

const SHIP_POS_REBUILT = 0;

function isFiniteNum(v){
    return typeof v === 'number' && Number.isFinite(v);
}

function transitPosition(ship){
    if (!ship || typeof ship !== 'object' || ship.inTransit !== true || !Array.isArray(ship.path) || ship.path.length === 0){ return null; }
    const leg = ship.path[0];
    const from = ship.origin && ship.origin.position;
    const to = leg && leg.destination && leg.destination.position;
    if (!from || !to || !isFiniteNum(leg.totalTime) || !isFiniteNum(ship.timeToNextStep)){ return null; }
    const axes = ['x', 'y', 'z'];
    if (!axes.every(a => isFiniteNum(from[a]) && isFiniteNum(to[a]))){ return null; }
    // Normalize -0 to the JSON-decoded value.
    const total = leg.totalTime + 0;
    let dist = total > 0 ? (ship.timeToNextStep + 0) / total : 0;
    if (!(dist >= 0)){ dist = 0; }
    else if (dist > 1){ dist = 1; }
    const pos = {};
    for (const a of axes){
        pos[a] = (to[a] + 0) * (1 - dist) + (from[a] + 0) * dist;
        if (!isFiniteNum(pos[a])){ return null; }
    }
    return pos;
}

function isRebuildable(ship, pos){
    if (!pos || typeof pos !== 'object' || Array.isArray(pos) || typeof pos.toJSON === 'function'){ return false; }
    if (Object.keys(pos).join(',') !== 'x,y,z'){ return false; }
    const want = transitPosition(ship);
    return want !== null && pos.x === want.x && pos.y === want.y && pos.z === want.z;
}

function shipList(state){
    const yard = state && state.space && state.space.shipyard;
    return yard && typeof yard === 'object' && Array.isArray(yard.ships) ? yard.ships : null;
}

// Return a copy with rebuildable ship positions packed.
function packShips(state){
    const ships = shipList(state);
    if (!ships){ return state; }
    const packed = ships.map(function(ship){
        const loc = ship && typeof ship === 'object' ? ship.location : undefined;
        if (!loc || typeof loc !== 'object' || !Object.prototype.hasOwnProperty.call(loc, 'position')){ return ship; }
        const pos = loc.position;
        let stored;
        if (isRebuildable(ship, pos)){ stored = SHIP_POS_REBUILT; }
        else if (typeof pos === 'number' || Array.isArray(pos)){ stored = [pos]; }
        else { return ship; }
        return Object.assign({}, ship, { location: Object.assign({}, loc, { position: stored }) });
    });
    const out = Object.assign({}, state);
    out.space = Object.assign({}, state.space);
    out.space.shipyard = Object.assign({}, state.space.shipyard, { ships: packed });
    return out;
}

// Restore packed ship positions after decoding.
function unpackShips(state){
    const ships = shipList(state);
    if (!ships){ return state; }
    for (const ship of ships){
        const loc = ship && typeof ship === 'object' ? ship.location : undefined;
        if (!loc || typeof loc !== 'object' || !Object.prototype.hasOwnProperty.call(loc, 'position')){ continue; }
        const pos = loc.position;
        if (pos === SHIP_POS_REBUILT){
            const rebuilt = transitPosition(ship);
            if (!rebuilt){ throw new Error('Corrupt save: ship position cannot be rebuilt'); }
            loc.position = rebuilt;
        }
        else if (Array.isArray(pos)){
            if (pos.length !== 1){ throw new Error('Corrupt save: malformed ship position'); }
            loc.position = pos[0];
        }
        else if (typeof pos === 'number'){
            throw new Error('Corrupt save: malformed ship position');
        }
    }
    return state;
}

// --- Save format selection -----------------------------------------------------------

const warned = {};

function warnOnce(key, message, err){
    if (warned[key]){ return; }
    warned[key] = true;
    console.warn(message, err);
}

// Serialize with a verified compact format, falling back to plain JSON.
function serialize(state){
    const pruned = pruneState(state);
    try {
        const ships = shipList(pruned);
        const packed = packShips(pruned);
        if (ships){
            const back = unpackShips(JSON.parse(JSON.stringify({ space: { shipyard: { ships: shipList(packed) } } })));
            if (JSON.stringify(shipList(back)) !== JSON.stringify(ships)){
                throw new Error('ship positions did not rebuild exactly');
            }
        }
        const json = JSON.stringify(packed);
        const text = JSON.stringify(shapeState(packed));
        if (JSON.stringify(unshapeState(JSON.parse(text))) !== json){
            throw new Error('shape round trip did not reproduce the save');
        }
        return { format: FORMAT_SHIPS, text };
    }
    catch (e){
        warnOnce('compact', 'Save compaction skipped, writing plain format:', e);
        return { format: FORMAT_PLAIN, text: JSON.stringify(pruned) };
    }
}

function deserialize(format, text){
    if (format === FORMAT_PLAIN){ return restoreState(JSON.parse(text)); }
    if (format === FORMAT_SHAPED){ return restoreState(unshapeState(JSON.parse(text))); }
    if (format === FORMAT_SHIPS){ return restoreState(unpackShips(unshapeState(JSON.parse(text)))); }
    throw new Error(`Unsupported save format version ${format}`);
}

// --- public API ----------------------------------------------------------------------

// Serialize game state for localStorage. Falls back to the legacy container if fflate did not
// load, so a missing <script> degrades to the old behaviour instead of losing the save.
export function encodeSaveString(state){
    const f = codec();
    if (!f){
        const lz = legacy();
        if (!lz){ throw new Error('No save codec available (fflate and LZString both missing)'); }
        return lz.compressToUTF16(JSON.stringify(state));
    }
    const { format, text } = serialize(state);
    const bytes = f.deflateSync(f.strToU8(text), DEFLATE_OPTS);
    const len = bytes.length;
    return SENTINEL
        + String.fromCharCode(format + CHAR_OFFSET)
        + String.fromCharCode(Math.floor(len / 32768) + CHAR_OFFSET)
        + String.fromCharCode((len % 32768) + CHAR_OFFSET)
        + pack15(bytes);
}

// Parse a localStorage save, new format or legacy. Returns null only when there is genuinely
// nothing to load; a payload we recognize but cannot decode throws, because silently returning
// null here would start a new game and the next autosave would overwrite the real save.
export function decodeSaveString(data){
    if (typeof data !== 'string' || data.length === 0){ return null; }

    if (data.charCodeAt(0) === 0){
        const f = codec();
        if (!f){ throw new Error('Save is in the compressed format but fflate failed to load'); }
        const format = data.charCodeAt(1) - CHAR_OFFSET;
        const len = ((data.charCodeAt(2) - CHAR_OFFSET) * 32768) + (data.charCodeAt(3) - CHAR_OFFSET);
        return deserialize(format, f.strFromU8(f.inflateSync(unpack15(data, 4, len))));
    }

    const lz = legacy();
    if (!lz){ throw new Error('Legacy save found but LZString failed to load'); }
    const json = lz.decompressFromUTF16(data);
    return json ? restoreState(JSON.parse(json)) : null;
}

// Serialize game state for the export box / cloud sync.
export function encodeExportString(state){
    const f = codec();
    if (!f){
        const lz = legacy();
        if (!lz){ throw new Error('No save codec available (fflate and LZString both missing)'); }
        return lz.compressToBase64(JSON.stringify(state));
    }
    const { format, text } = serialize(state);
    return EXPORT_PREFIX[format] + bytesToB64(f.deflateSync(f.strToU8(text), DEFLATE_OPTS));
}

// Parse current and legacy export formats.
export function decodeExportString(data){
    if (typeof data !== 'string'){ return null; }
    data = data.trim();
    if (data.length === 0){ return null; }

    for (const format of FORMATS){
        const prefix = EXPORT_PREFIX[format];
        if (data.startsWith(prefix)){
            const f = codec();
            if (!f){ throw new Error('Save is in the compressed format but fflate failed to load'); }
            return deserialize(format, f.strFromU8(f.inflateSync(b64ToBytes(data.slice(prefix.length)))));
        }
    }
    if (data.charCodeAt(0) === 0){ return decodeSaveString(data); }

    const lz = legacy();
    if (!lz){ throw new Error('Legacy save found but LZString failed to load'); }
    let json = lz.decompressFromBase64(data);
    if (!json || json.charAt(0) !== '{'){ json = lz.decompressFromUTF16(data); }
    return (json && json.charAt(0) === '{') ? restoreState(JSON.parse(json)) : null;
}
