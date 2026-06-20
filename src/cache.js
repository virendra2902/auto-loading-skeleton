'use strict';

/**
 * cache.js — V2
 *
 * LRU-style descriptor cache so repeated renders of the same component
 * tree skip the recursive analyzeElement walk.
 *
 * Key: shallow fingerprint of the React element (type + prop keys + child count)
 * Value: the analyzed descriptor
 * Capacity: 32 entries (configurable)
 */

var MAX = 32;
var _cache = new Map();

function fingerprint(element) {
  if (!element || typeof element !== 'object') return String(element);
  var t = typeof element.type === 'string' ? element.type : (element.type && element.type.displayName) || '?';
  var p = element.props ? Object.keys(element.props).sort().join(',') : '';
  var c = element.props && element.props.children;
  var cl = Array.isArray(c) ? c.length : (c ? 1 : 0);
  return t + '|' + p + '|' + cl;
}

function get(element) {
  var key = fingerprint(element);
  if (!_cache.has(key)) return null;
  // LRU: move to end
  var val = _cache.get(key);
  _cache.delete(key);
  _cache.set(key, val);
  return val;
}

function set(element, descriptor) {
  var key = fingerprint(element);
  if (_cache.size >= MAX) {
    // evict oldest entry
    _cache.delete(_cache.keys().next().value);
  }
  _cache.set(key, descriptor);
}

function clear() { _cache.clear(); }

module.exports = { get, set, clear, fingerprint };
