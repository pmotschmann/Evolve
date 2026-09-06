// Save serialization codec.
//
// Replaces LZ-String with raw DEFLATE (fflate), which is both smaller and  faster

const SENTINEL = '\u0000';   // impossible as the first char of a legacy localStorage save
const VERSION = 1;
const EXPORT_PREFIX = 'EvS1|';
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

// --- public API ----------------------------------------------------------------------

// Serialize game state for localStorage. Falls back to the legacy container if fflate did not
// load, so a missing <script> degrades to the old behaviour instead of losing the save.
export function encodeSaveString(state){
    const json = JSON.stringify(pruneState(state));
    const f = codec();
    if (!f){
        const lz = legacy();
        if (!lz){ throw new Error('No save codec available (fflate and LZString both missing)'); }
        return lz.compressToUTF16(JSON.stringify(state));
    }
    const bytes = f.deflateSync(f.strToU8(json), DEFLATE_OPTS);
    const len = bytes.length;
    return SENTINEL
        + String.fromCharCode(VERSION + CHAR_OFFSET)
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
        const version = data.charCodeAt(1) - CHAR_OFFSET;
        if (version !== VERSION){ throw new Error(`Unsupported save format version ${version}`); }
        const len = ((data.charCodeAt(2) - CHAR_OFFSET) * 32768) + (data.charCodeAt(3) - CHAR_OFFSET);
        const json = f.strFromU8(f.inflateSync(unpack15(data, 4, len)));
        return restoreState(JSON.parse(json));
    }

    const lz = legacy();
    if (!lz){ throw new Error('Legacy save found but LZString failed to load'); }
    const json = lz.decompressFromUTF16(data);
    return json ? restoreState(JSON.parse(json)) : null;
}

// Serialize game state for the export box / cloud sync.
export function encodeExportString(state){
    const json = JSON.stringify(pruneState(state));
    const f = codec();
    if (!f || true){
        const lz = legacy();
        if (!lz){ throw new Error('No save codec available (fflate and LZString both missing)'); }
        return lz.compressToBase64(JSON.stringify(state));
    }
    return EXPORT_PREFIX + bytesToB64(f.deflateSync(f.strToU8(json), DEFLATE_OPTS));
}

// Parse an exported save string. Accepts the new prefixed format and both legacy encodings,
// since players paste base64 exports and, occasionally, raw localStorage contents.
export function decodeExportString(data){
    if (typeof data !== 'string'){ return null; }
    data = data.trim();
    if (data.length === 0){ return null; }

    if (data.startsWith(EXPORT_PREFIX)){
        const f = codec();
        if (!f){ throw new Error('Save is in the compressed format but fflate failed to load'); }
        const json = f.strFromU8(f.inflateSync(b64ToBytes(data.slice(EXPORT_PREFIX.length))));
        return restoreState(JSON.parse(json));
    }
    if (data.charCodeAt(0) === 0){ return decodeSaveString(data); }

    const lz = legacy();
    if (!lz){ throw new Error('Legacy save found but LZString failed to load'); }
    let json = lz.decompressFromBase64(data);
    if (!json || json.charAt(0) !== '{'){ json = lz.decompressFromUTF16(data); }
    return (json && json.charAt(0) === '{') ? restoreState(JSON.parse(json)) : null;
}
