// A vanilla-DOM stand-in for the slice of jQuery this codebase actually uses.
//
// The game used jQuery purely as a DOM convenience layer: no $.fn plugins, no $.ajax, no vendored
// library depending on it. This module reimplements that slice on native DOM so the CDN dependency
// can be dropped without touching the ~3600 call sites, which keep their existing shape.
//
// It is deliberately NOT a general jQuery clone. Methods here match jQuery's behaviour only as far
// as this codebase relies on it; anything unused is absent rather than approximated. If a call site
// needs a behaviour that is missing, add it here rather than working around it at the call site.

// ---------------------------------------------------------------------------------------------
// Node coercion

// No trim: an insertion fragment can legitimately open with text (", <span…>"), and dropping the
// leading whitespace would change what is rendered. Callers that need the trimmed form for a
// starts-with-'<' test do that themselves before calling in.
function parseHTML(html){
    const tpl = document.createElement('template');
    tpl.innerHTML = String(html);
    return Array.from(tpl.content.childNodes);
}

// Anything that can stand in for "a set of nodes" at a call site, flattened to a plain array.
function toNodes(value, context){
    if (value === null || value === undefined || value === false){ return []; }
    if (value instanceof DomList){ return value.toArray(); }
    if (value instanceof Node || value === window){ return [value]; }
    if (typeof value === 'string'){
        const str = value.trim();
        if (str.charAt(0) === '<'){ return parseHTML(str); }
        const root = context ? (context instanceof DomList ? context.get(0) : context) : document;
        if (!root || !root.querySelectorAll){ return []; }
        return Array.from(root.querySelectorAll(str));
    }
    // NodeList, HTMLCollection, array, or any other iterable of nodes.
    if (typeof value.length === 'number' && typeof value !== 'function'){
        return Array.from(value).filter(n => n instanceof Node || n === window);
    }
    // Anything else becomes a one-item set, exactly as jQuery does. This is not an edge case here:
    // the action registries wrap their own `this` to reach it, as in `$(this)[0].name()`, ~1900
    // times across tech/space/truepath/actions/portal/edenic. Those objects are not nodes, and
    // dropping them would turn every such call into a read of undefined.
    return [value];
}

// Only elements can take classes, attributes or children; document and window cannot.
function isElement(node){ return node && node.nodeType === 1; }

// ---------------------------------------------------------------------------------------------
// Event bookkeeping
//
// Native listeners carry no identity, so removing one by name (or by jQuery's "namespace" suffix)
// means remembering what was bound. One record per (element, type, namespace, selector, handler).

const eventStore = new WeakMap();

function records(node){
    let list = eventStore.get(node);
    if (!list){ list = []; eventStore.set(node, list); }
    return list;
}

// "click.foo" -> { type: 'click', ns: 'foo' }; ".foo" -> { type: '', ns: 'foo' }
function parseEvent(token){
    const dot = token.indexOf('.');
    if (dot === -1){ return { type: token, ns: '' }; }
    return { type: token.slice(0, dot), ns: token.slice(dot + 1) };
}

// ---------------------------------------------------------------------------------------------
// Data store
//
// .data() here reads data-* attributes, which is how every call site uses it (the value is written
// into the markup as data-id / data-panel / data-gov). A written value is kept in memory the way
// jQuery does, so a round-trip through .data() does not have to survive as a string.

const dataStore = new WeakMap();

function camelToDash(key){ return String(key).replace(/[A-Z]/g, m => '-' + m.toLowerCase()); }

// ---------------------------------------------------------------------------------------------

class DomList {
    constructor(nodes){
        const list = nodes || [];
        // De-duplicate while preserving order: a selector union can name the same node twice.
        const seen = [];
        for (const node of list){
            if (node && seen.indexOf(node) === -1){ seen.push(node); }
        }
        for (let i = 0; i < seen.length; i++){ this[i] = seen[i]; }
        this.length = seen.length;
    }

    toArray(){ return Array.prototype.slice.call(this); }

    // jQuery's .get(): no argument yields a real array, an index yields one node.
    get(index){
        if (index === undefined){ return this.toArray(); }
        return index < 0 ? this[this.length + index] : this[index];
    }

    [Symbol.iterator](){ return this.toArray()[Symbol.iterator](); }

    // Callback runs with `this` set to the node, and (index, node) as arguments — both forms are
    // used in the codebase.
    each(fn){
        const nodes = this.toArray();
        for (let i = 0; i < nodes.length; i++){
            if (fn.call(nodes[i], i, nodes[i]) === false){ break; }
        }
        return this;
    }

    // -- traversal -----------------------------------------------------------------------------

    find(selector){
        const out = [];
        for (const node of this){
            if (node && node.querySelectorAll){
                out.push(...node.querySelectorAll(selector));
            }
        }
        return new DomList(out);
    }

    closest(selector){
        const out = [];
        for (const node of this){
            const hit = isElement(node) ? node.closest(selector) : null;
            if (hit){ out.push(hit); }
        }
        return new DomList(out);
    }

    children(selector){
        const out = [];
        for (const node of this){
            if (!node || !node.children){ continue; }
            for (const child of node.children){
                if (!selector || child.matches(selector)){ out.push(child); }
            }
        }
        return new DomList(out);
    }

    parent(){
        return new DomList(this.toArray().map(n => n && n.parentElement).filter(Boolean));
    }

    next(){
        return new DomList(this.toArray().map(n => n && n.nextElementSibling).filter(Boolean));
    }

    prev(){
        return new DomList(this.toArray().map(n => n && n.previousElementSibling).filter(Boolean));
    }

    siblings(){
        const out = [];
        for (const node of this){
            if (!node || !node.parentElement){ continue; }
            for (const sib of node.parentElement.children){
                if (sib !== node){ out.push(sib); }
            }
        }
        return new DomList(out);
    }

    // Every following sibling, nearest first, optionally narrowed by a selector.
    nextAll(selector){
        const out = [];
        for (const node of this){
            let sib = node && node.nextElementSibling;
            while (sib){
                if (!selector || sib.matches(selector)){ out.push(sib); }
                sib = sib.nextElementSibling;
            }
        }
        return new DomList(out);
    }

    // Every preceding sibling. jQuery orders these nearest-first, which is what the power-grid
    // lookup in industry.js depends on — it takes .attr() off the first match.
    prevAll(selector){
        const out = [];
        for (const node of this){
            let sib = node && node.previousElementSibling;
            while (sib){
                if (!selector || sib.matches(selector)){ out.push(sib); }
                sib = sib.previousElementSibling;
            }
        }
        return new DomList(out);
    }

    slice(start, end){
        return new DomList(this.toArray().slice(start, end));
    }

    filter(selector){
        if (typeof selector === 'function'){
            return new DomList(this.toArray().filter((n, i) => selector.call(n, i, n)));
        }
        return new DomList(this.toArray().filter(n => isElement(n) && n.matches(selector)));
    }

    not(selector){
        return new DomList(this.toArray().filter(n => !(isElement(n) && n.matches(selector))));
    }

    is(selector){
        if (typeof selector === 'function'){
            return this.toArray().some((n, i) => selector.call(n, i, n));
        }
        return this.toArray().some(n => isElement(n) && n.matches(selector));
    }

    add(other){
        return new DomList(this.toArray().concat(toNodes(other)));
    }

    eq(index){
        const node = this.get(index);
        return new DomList(node ? [node] : []);
    }

    first(){ return this.eq(0); }
    last(){ return this.eq(this.length - 1); }

    index(){
        const node = this.get(0);
        if (!node || !node.parentElement){ return -1; }
        return Array.prototype.indexOf.call(node.parentElement.children, node);
    }

    // -- classes -------------------------------------------------------------------------------

    addClass(names){
        const parts = String(names).split(/\s+/).filter(Boolean);
        for (const node of this){ if (isElement(node)){ node.classList.add(...parts); } }
        return this;
    }

    removeClass(names){
        if (names === undefined){
            for (const node of this){ if (isElement(node)){ node.className = ''; } }
            return this;
        }
        const parts = String(names).split(/\s+/).filter(Boolean);
        for (const node of this){ if (isElement(node)){ node.classList.remove(...parts); } }
        return this;
    }

    toggleClass(names, force){
        const parts = String(names).split(/\s+/).filter(Boolean);
        for (const node of this){
            if (!isElement(node)){ continue; }
            for (const part of parts){
                if (force === undefined){ node.classList.toggle(part); }
                else { node.classList.toggle(part, !!force); }
            }
        }
        return this;
    }

    hasClass(name){
        return this.toArray().some(n => isElement(n) && n.classList.contains(name));
    }

    // -- attributes and properties -------------------------------------------------------------

    attr(name, value){
        if (typeof name === 'object' && name !== null){
            for (const key of Object.keys(name)){ this.attr(key, name[key]); }
            return this;
        }
        if (value === undefined){
            const node = this.get(0);
            if (!isElement(node)){ return undefined; }
            // jQuery yields undefined, not null, for an absent attribute.
            const got = node.getAttribute(name);
            return got === null ? undefined : got;
        }
        for (const node of this){ if (isElement(node)){ node.setAttribute(name, value); } }
        return this;
    }

    removeAttr(name){
        for (const node of this){ if (isElement(node)){ node.removeAttribute(name); } }
        return this;
    }

    prop(name, value){
        if (value === undefined){
            const node = this.get(0);
            return node ? node[name] : undefined;
        }
        for (const node of this){ if (node){ node[name] = value; } }
        return this;
    }

    val(value){
        if (value === undefined){
            const node = this.get(0);
            return node ? node.value : undefined;
        }
        for (const node of this){ if (node && 'value' in node){ node.value = value; } }
        return this;
    }

    data(key, value){
        if (value === undefined){
            const node = this.get(0);
            if (!node){ return undefined; }
            const stored = dataStore.get(node);
            if (stored && key in stored){ return stored[key]; }
            if (!isElement(node)){ return undefined; }
            const got = node.getAttribute('data-' + camelToDash(key));
            return got === null ? undefined : got;
        }
        for (const node of this){
            let stored = dataStore.get(node);
            if (!stored){ stored = {}; dataStore.set(node, stored); }
            stored[key] = value;
        }
        return this;
    }

    // -- content -------------------------------------------------------------------------------

    html(value){
        if (value === undefined){
            const node = this.get(0);
            return node ? node.innerHTML : undefined;
        }
        for (const node of this){ if (node){ node.innerHTML = value; } }
        return this;
    }

    text(value){
        if (value === undefined){
            const node = this.get(0);
            return node ? node.textContent : undefined;
        }
        for (const node of this){ if (node){ node.textContent = value; } }
        return this;
    }

    empty(){
        for (const node of this){ if (node){ node.textContent = ''; } }
        return this;
    }

    // -- insertion -----------------------------------------------------------------------------
    //
    // A node can only live in one place, so when a set has more than one target every target after
    // the first receives a clone — jQuery's rule, and what the multi-target call sites expect.

    _insert(args, place){
        const targets = this.toArray();
        if (!targets.length){ return this; }
        const incoming = [];
        for (const arg of args){
            // A string handed to an insertion method is always markup, never a selector — jQuery
            // draws the same line, and only $() itself guesses between the two. Routing these
            // through toNodes() would send a fragment that happens not to start with '<' (the
            // wiki builds `, <span…>` when joining requirements) into querySelectorAll, which
            // throws on it. parseHTML also keeps any leading text node, which that markup relies on.
            if (typeof arg === 'string'){ incoming.push(...parseHTML(arg)); }
            else { incoming.push(...toNodes(arg)); }
        }
        targets.forEach((target, index) => {
            if (!target || !target.appendChild){ return; }
            const batch = index === 0 ? incoming : incoming.map(n => n.cloneNode(true));
            place(target, batch);
        });
        return this;
    }

    append(...args){
        return this._insert(args, (target, batch) => { for (const n of batch){ target.appendChild(n); } });
    }

    prepend(...args){
        return this._insert(args, (target, batch) => {
            for (let i = batch.length - 1; i >= 0; i--){ target.insertBefore(batch[i], target.firstChild); }
        });
    }

    before(...args){
        return this._insert(args, (target, batch) => {
            if (!target.parentNode){ return; }
            for (const n of batch){ target.parentNode.insertBefore(n, target); }
        });
    }

    after(...args){
        return this._insert(args, (target, batch) => {
            if (!target.parentNode){ return; }
            for (let i = batch.length - 1; i >= 0; i--){
                target.parentNode.insertBefore(batch[i], target.nextSibling);
            }
        });
    }

    // --- native-API bridge --------------------------------------------------------------------
    //
    // The jQuery migration converts call sites to the native names, but a receiver may still be a
    // DomList (its own `$(selector)` not yet converted). Mirroring the two native insertion methods
    // here means a converted call site behaves identically either way, so creation sites and their
    // .append() calls do not have to move in the same commit.

    insertAdjacentHTML(position, html){
        for (const node of this){
            if (isElement(node)){ node.insertAdjacentHTML(position, html); }
        }
        return this;
    }

    appendChild(child){
        const nodes = toNodes(child);
        const target = this.get(0);
        if (target && target.appendChild){
            for (const n of nodes){ target.appendChild(n); }
        }
        return child;
    }

    // These return the moved set, not the target, so chaining continues on what was inserted.
    appendTo(target){ $(target).append(this); return this; }
    prependTo(target){ $(target).prepend(this); return this; }
    insertBefore(target){ $(target).before(this); return this; }
    insertAfter(target){ $(target).after(this); return this; }

    remove(){
        for (const node of this){
            if (node && node.parentNode){ node.parentNode.removeChild(node); }
            eventStore.delete(node);
        }
        return this;
    }

    // Same as remove() but keeps the handlers, so the node can be put back.
    detach(){
        for (const node of this){
            if (node && node.parentNode){ node.parentNode.removeChild(node); }
        }
        return this;
    }

    clone(){
        return new DomList(this.toArray().map(n => n.cloneNode(true)));
    }

    // -- style ---------------------------------------------------------------------------------

    css(name, value){
        if (typeof name === 'object' && name !== null){
            for (const key of Object.keys(name)){ this.css(key, name[key]); }
            return this;
        }
        if (value === undefined){
            const node = this.get(0);
            if (!isElement(node)){ return undefined; }
            return window.getComputedStyle(node).getPropertyValue(name);
        }
        const prop = camelToDash(name);
        for (const node of this){
            if (!isElement(node)){ continue; }
            // setProperty is required for custom properties and harmless for the rest, but it will
            // not accept a bare number the way jQuery does, so add the unit jQuery would.
            const out = typeof value === 'number' && !/^(z-index|opacity|order|flex|line-height|font-weight)$/.test(prop)
                ? value + 'px' : String(value);
            node.style.setProperty(prop, out);
        }
        return this;
    }

    show(){
        for (const node of this){
            if (isElement(node)){ node.style.removeProperty('display'); }
        }
        return this;
    }

    hide(){
        for (const node of this){ if (isElement(node)){ node.style.display = 'none'; } }
        return this;
    }

    // -- measurement ---------------------------------------------------------------------------

    width(){
        const node = this.get(0);
        if (node === window){ return window.innerWidth; }
        return isElement(node) ? node.getBoundingClientRect().width : undefined;
    }

    height(){
        const node = this.get(0);
        if (node === window){ return window.innerHeight; }
        return isElement(node) ? node.getBoundingClientRect().height : undefined;
    }

    outerWidth(){
        const node = this.get(0);
        return isElement(node) ? node.offsetWidth : undefined;
    }

    outerHeight(){
        const node = this.get(0);
        return isElement(node) ? node.offsetHeight : undefined;
    }

    offset(){
        const node = this.get(0);
        if (!isElement(node)){ return undefined; }
        const rect = node.getBoundingClientRect();
        return { top: rect.top + window.scrollY, left: rect.left + window.scrollX };
    }

    position(){
        const node = this.get(0);
        if (!isElement(node)){ return undefined; }
        return { top: node.offsetTop, left: node.offsetLeft };
    }

    scrollTop(value){
        if (value === undefined){
            const node = this.get(0);
            if (node === window){ return window.scrollY; }
            return node ? node.scrollTop : undefined;
        }
        for (const node of this){
            if (node === window){ window.scrollTo(window.scrollX, value); }
            else if (node){ node.scrollTop = value; }
        }
        return this;
    }

    // -- events --------------------------------------------------------------------------------

    // .on('click', fn) | .on('click.ns touchend.ns', fn) | .on('click', '.child', fn)
    on(events, selector, handler){
        if (typeof selector === 'function'){ handler = selector; selector = null; }
        for (const token of String(events).split(/\s+/).filter(Boolean)){
            const { type, ns } = parseEvent(token);
            if (!type){ continue; }
            for (const node of this){
                if (!node || !node.addEventListener){ continue; }
                const wrapped = function(event){
                    let target = node;
                    if (selector){
                        const match = event.target && event.target.closest
                            ? event.target.closest(selector) : null;
                        // Ignore a match that lives outside the delegating element.
                        if (!match || !node.contains(match)){ return; }
                        target = match;
                    }
                    const result = handler.call(target, event);
                    // jQuery treats a false return as "stop here".
                    if (result === false){ event.preventDefault(); event.stopPropagation(); }
                    return result;
                };
                node.addEventListener(type, wrapped);
                records(node).push({ type, ns, selector, handler, wrapped });
            }
        }
        return this;
    }

    // .off() | .off('click') | .off('click.ns') | .off('.ns')
    off(events, handler){
        for (const node of this){
            if (!node || !node.removeEventListener){ continue; }
            const list = records(node);
            const tokens = events === undefined ? [''] : String(events).split(/\s+/).filter(Boolean);
            for (const token of tokens){
                const { type, ns } = token ? parseEvent(token) : { type: '', ns: '' };
                for (let i = list.length - 1; i >= 0; i--){
                    const rec = list[i];
                    if (type && rec.type !== type){ continue; }
                    if (ns && rec.ns !== ns){ continue; }
                    if (handler && rec.handler !== handler){ continue; }
                    node.removeEventListener(rec.type, rec.wrapped);
                    list.splice(i, 1);
                }
            }
        }
        return this;
    }

    // jQuery calls the matching native method when there is one, so .trigger('focus') actually
    // focuses rather than only dispatching an event nothing acted on.
    trigger(type, detail){
        for (const node of this){
            if (!node){ continue; }
            if (typeof node[type] === 'function'){ node[type](); continue; }
            node.dispatchEvent(new CustomEvent(type, { bubbles: true, cancelable: true, detail }));
        }
        return this;
    }

    // -- animation -----------------------------------------------------------------------------

    // Only the handful of height/opacity tweens the game runs, driven by a CSS transition rather
    // than a JS timer. Anything not animatable this way is set immediately.
    animate(props, duration){
        const ms = typeof duration === 'number' ? duration : 400;
        for (const node of this){
            if (!isElement(node)){ continue; }
            const keys = Object.keys(props);
            // A transition only fires if the property already has a resolved starting value.
            const computed = window.getComputedStyle(node);
            for (const key of keys){ node.style.setProperty(camelToDash(key), computed.getPropertyValue(camelToDash(key))); }
            void node.offsetWidth;   // flush, so the start value is committed before the change
            node.style.transition = keys.map(k => `${camelToDash(k)} ${ms}ms ease`).join(', ');
            for (const key of keys){
                const value = props[key];
                const out = typeof value === 'number' && key !== 'opacity' ? value + 'px' : String(value);
                node.style.setProperty(camelToDash(key), out);
            }
            setTimeout(() => { node.style.removeProperty('transition'); }, ms + 30);
        }
        return this;
    }
}

// Shorthand event binders the codebase uses directly. With a handler they bind; with none they
// fire, which for click/focus/select means calling the element's own method (see trigger).
for (const name of ['click','focus','blur','select','change','input','submit','keydown','keyup',
                    'mouseover','mouseenter','mouseleave','touchend','resize','scroll']){
    DomList.prototype[name] = function(handler){
        return handler === undefined ? this.trigger(name) : this.on(name, handler);
    };
}

// ---------------------------------------------------------------------------------------------

export function $(value, context){
    if (value instanceof DomList){ return value; }
    // $(fn) — run once the document is parsed.
    if (typeof value === 'function'){
        if (document.readyState === 'loading'){
            document.addEventListener('DOMContentLoaded', () => value($));
        }
        else { value($); }
        return new DomList([]);
    }
    return new DomList(toNodes(value, context));
}

$.fn = DomList.prototype;

// ---------------------------------------------------------------------------------------------
// Static helpers
//
// The four $.* functions the codebase calls. These stay faithful to jQuery rather than being
// modernised: locale.js loads its string pack with async:false and every loc() call downstream
// assumes the strings are in place the moment getString() returns. Moving that to fetch would be
// a behavioural change well beyond removing the dependency, so the synchronous path is preserved.

let ajaxAsync = true;

$.ajaxSetup = function(options){
    if (options && typeof options.async === 'boolean'){ ajaxAsync = options.async; }
};

$.each = function(collection, fn){
    const list = collection instanceof DomList ? collection.toArray() : Array.from(collection || []);
    for (let i = 0; i < list.length; i++){
        if (fn.call(list[i], i, list[i]) === false){ break; }
    }
    return collection;
};

$.getJSON = function(url, success){
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, ajaxAsync);
    const done = function(){
        if (xhr.status < 200 || xhr.status >= 300){ return; }
        let data;
        try { data = JSON.parse(xhr.responseText); }
        catch (e){ return; }
        if (success){ success(data); }
    };
    // A synchronous request has already completed by the time send() returns, and onload is not
    // dispatched for it, so the callback is run inline instead.
    if (ajaxAsync){ xhr.onload = done; }
    xhr.send(null);
    if (!ajaxAsync){ done(); }
    return xhr;
};

$.ajax = function(options){
    const opts = options || {};
    const async = opts.async !== undefined ? opts.async : ajaxAsync;
    const xhr = new XMLHttpRequest();
    xhr.open(opts.type || 'GET', opts.url, async);
    const done = function(){
        if (xhr.status >= 200 && xhr.status < 300){
            let data = xhr.responseText;
            if (opts.dataType === 'json'){
                try { data = JSON.parse(data); }
                catch (e){ if (opts.error){ opts.error(xhr, 'parsererror', e); } return; }
            }
            if (opts.success){ opts.success(data, 'success', xhr); }
        }
        else if (opts.error){ opts.error(xhr, 'error'); }
    };
    if (async){
        xhr.onload = done;
        xhr.onerror = function(){ if (opts.error){ opts.error(xhr, 'error'); } };
    }
    xhr.send(opts.data || null);
    if (!async){ done(); }
    return xhr;
};

export { DomList };
export default $;
