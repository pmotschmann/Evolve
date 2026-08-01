import { global } from './vars.js';
import { loc } from './locale.js';
import { messageQueue } from './functions.js';

// =============================================================================
// Google Drive save sync
// -----------------------------------------------------------------------------
// Saves the same string produced by the "Export Game" button (an LZString-base64
// snapshot of `global`) to the player's Google Drive, and loads it back.
//
// Saves live in Drive's hidden per-application "appDataFolder" (OAuth scope
// `drive.appdata`). That folder is private to this app: the game can only ever
// read/write its own save file and has NO access to anything else in the user's
// Drive.
//
// ONE-TIME SETUP (per deployment — the hosted site operator does this once):
//   1. Create a project at https://console.cloud.google.com/
//   2. APIs & Services → Library → enable the "Google Drive API".
//   3. APIs & Services → OAuth consent screen → configure it (User type
//      "External"; while the app is unverified, add each player as a "Test user",
//      or publish the app). Only the `drive.appdata` scope is needed.
//   4. APIs & Services → Credentials → Create Credentials → OAuth client ID →
//      "Web application". Under "Authorized JavaScript origins" add the exact
//      origin the game is served from (e.g. https://yourname.github.io, and
//      http://localhost:8080 for local testing with `npm run serve`).
//   5. Paste the generated Client ID into GOOGLE_CLIENT_ID below and rebuild.
//
// Until GOOGLE_CLIENT_ID is set the buttons appear but explain that Drive sync
// has not been configured.
// =============================================================================
export const GOOGLE_CLIENT_ID = '965884226027-9tk16gs0pjq41mbeh12l70viis6vkqb9.apps.googleusercontent.com';

const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.appdata';
const SAVE_FILENAME = 'evolve.save';
const GIS_SRC = 'https://accounts.google.com/gsi/client';

let gisPromise = null;
let tokenClient = null;
let cachedToken = null;

export function driveConfigured(){
    return typeof GOOGLE_CLIENT_ID === 'string' && GOOGLE_CLIENT_ID.length > 0;
}

// Inject the Google Identity Services script once and resolve when it is ready.
function loadGis(){
    if (gisPromise){ return gisPromise; }
    gisPromise = new Promise((resolve, reject) => {
        if (window.google && window.google.accounts && window.google.accounts.oauth2){
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = GIS_SRC;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () => { gisPromise = null; reject(new Error('Failed to load Google sign-in')); };
        document.head.appendChild(script);
    });
    return gisPromise;
}

// Request an OAuth access token for the appdata scope.
function getToken(){
    return new Promise((resolve, reject) => {
        try {
            if (!tokenClient){
                tokenClient = window.google.accounts.oauth2.initTokenClient({
                    client_id: GOOGLE_CLIENT_ID,
                    scope: DRIVE_SCOPE,
                    callback: () => {}
                });
            }
            tokenClient.callback = (resp) => {
                if (resp && resp.error){ reject(new Error(resp.error)); return; }
                cachedToken = resp.access_token;
                resolve(cachedToken);
            };
            // prompt '' → reuse an existing grant without re-prompting when possible.
            tokenClient.requestAccessToken({ prompt: '' });
        }
        catch (e){ reject(e); }
    });
}

async function authFetch(url, options, token){
    options = options || {};
    options.headers = Object.assign({}, options.headers || {}, { Authorization: `Bearer ${token}` });
    const resp = await fetch(url, options);
    if (!resp.ok){
        // A stale token → force a fresh consent/token on the next attempt.
        if (resp.status === 401){ cachedToken = null; }
        const text = await resp.text().catch(() => '');
        throw new Error(`HTTP ${resp.status}${text ? ': ' + text : ''}`);
    }
    return resp;
}

// Find the id of the existing save file in appDataFolder (or null).
async function findSaveFile(token){
    const q = `name='${SAVE_FILENAME}' and trashed=false`;
    const url = 'https://www.googleapis.com/drive/v3/files'
        + '?spaces=appDataFolder'
        + `&q=${encodeURIComponent(q)}`
        + '&fields=files(id,modifiedTime)'
        + '&orderBy=modifiedTime desc';
    const resp = await authFetch(url, { method: 'GET' }, token);
    const data = await resp.json();
    return (data.files && data.files.length > 0) ? data.files[0].id : null;
}

// Shared preamble: verify config, load the library, and get a token.
async function prepare(){
    if (!driveConfigured()){
        messageQueue(loc('drive_not_configured'), 'warning');
        return null;
    }
    await loadGis();
    return await getToken();
}

export async function driveSaveGame(){
    if (global.race['noexport']){
        messageQueue(loc('drive_error', [loc('drive_noexport', [global.race['noexport']])]), 'danger');
        return;
    }

    let token;
    try { token = await prepare(); }
    catch (e){ messageQueue(loc('drive_error', [String(e && e.message ? e.message : e)]), 'danger'); return; }
    if (!token){ return; }

    const data = window.exportGame();
    messageQueue(loc('drive_saving'), 'info');
    try {
        const fileId = await findSaveFile(token);
        if (fileId){
            await authFetch(
                `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`,
                { method: 'PATCH', headers: { 'Content-Type': 'text/plain' }, body: data },
                token
            );
        }
        else {
            const boundary = 'evolveSaveBoundary';
            const metadata = { name: SAVE_FILENAME, parents: ['appDataFolder'], mimeType: 'text/plain' };
            const body =
                `--${boundary}\r\n` +
                'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
                JSON.stringify(metadata) + '\r\n' +
                `--${boundary}\r\n` +
                'Content-Type: text/plain\r\n\r\n' +
                data + '\r\n' +
                `--${boundary}--`;
            await authFetch(
                'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id',
                { method: 'POST', headers: { 'Content-Type': `multipart/related; boundary=${boundary}` }, body },
                token
            );
        }
        messageQueue(loc('drive_saved'), 'success');
    }
    catch (e){
        messageQueue(loc('drive_error', [String(e && e.message ? e.message : e)]), 'danger');
    }
}

export async function driveLoadGame(){
    let token;
    try { token = await prepare(); }
    catch (e){ messageQueue(loc('drive_error', [String(e && e.message ? e.message : e)]), 'danger'); return; }
    if (!token){ return; }

    messageQueue(loc('drive_loading'), 'info');
    try {
        const fileId = await findSaveFile(token);
        if (!fileId){
            messageQueue(loc('drive_none'), 'warning');
            return;
        }
        const resp = await authFetch(
            `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
            { method: 'GET' }, token
        );
        const data = (await resp.text()).trim();
        // importGame reloads the page when the save is valid; if it returns, the
        // downloaded data was not a valid Evolve save.
        window.importGame(data);
        messageQueue(loc('drive_error', [loc('drive_invalid')]), 'danger');
    }
    catch (e){
        messageQueue(loc('drive_error', [String(e && e.message ? e.message : e)]), 'danger');
    }
}
