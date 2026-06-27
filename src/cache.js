'use strict';
/* cache.js — V4 */
const MAX = 128; // doubled from V3
const _map = new Map();
let _hits = 0, _misses = 0;

function _key(el) {
  if (!el || typeof el !== 'object') return String(el);
  const t = typeof el.type === 'string' ? el.type : (el.type&&(el.type.displayName||el.type.name))||'?';
  const p = el.props ? Object.keys(el.props).sort().join(',') : '';
  const c = el.props && el.props.children;
  const cl = Array.isArray(c) ? c.length : (c?1:0);
  const klass = (el.props&&el.props.className) ? el.props.className.slice(0,28) : '';
  return `${t}|${klass}|${p}|${cl}`;
}

function get(el) {
  const k = _key(el);
  if (!_map.has(k)) { _misses++; return null; }
  const v = _map.get(k); _map.delete(k); _map.set(k, v); _hits++;
  return v.descriptor;
}

function set(el, descriptor) {
  const k = _key(el);
  if (_map.size >= MAX) _map.delete(_map.keys().next().value);
  _map.set(k, { descriptor, ts: Date.now() });
}

function clear()    { _map.clear(); }
function invalidate(el) { _map.delete(_key(el)); }
function stats()    { return { size: _map.size, hits: _hits, misses: _misses, hitRate: (_hits+_misses)?_hits/(_hits+_misses):0 }; }

module.exports = { get, set, clear, invalidate, stats };
