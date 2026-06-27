'use strict';
/**
 * differ.js — V4 (entirely new)
 *
 * Skeleton Tree Differ:
 *   Compares the current descriptor tree hash against the previous render.
 *   If a subtree hasn't changed, returns the cached React element directly,
 *   skipping renderNode entirely for that branch.
 *
 * This gives V4 near-zero re-render cost for stable skeletons inside
 * frequently updating parent components (e.g. real-time dashboards where
 * only one panel is loading).
 *
 * API:
 *   hashNode(descriptor) → string
 *   diff(prevHash, descriptor) → { changed: boolean, hash: string }
 *   SkeletonDiffCache → per-instance cache of { hash, element }
 */

/* ── djb2 hash ── */
function hashStr(s) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h) ^ s.charCodeAt(i);
  return (h >>> 0).toString(36);
}

/* ── Structural hash of a descriptor tree ── */
function hashNode(node, depth) {
  if (!node) return '0';
  depth = depth || 0;
  if (depth > 6) return 'd';

  const parts = [
    node.nodeType || '?',
    node._conf != null ? Math.round(node._conf * 10) : '',
    node.width || '',
    node.height || '',
    (node.styleHints && node.styleHints.width)  || '',
    (node.styleHints && node.styleHints.height) || '',
    node.count != null ? String(node.count) : '',
    node.level != null ? String(node.level) : '',
    node.rows   != null ? String(node.rows)  : '',
    node.cols   != null ? String(node.cols)  : '',
    node.stars  != null ? String(node.stars) : '',
    node.steps  != null ? String(node.steps) : '',
  ];

  if (node.children && node.children.length) {
    parts.push(node.children.map(c => hashNode(c, depth + 1)).join(','));
  }
  if (node.template) {
    parts.push('t:' + hashNode(node.template, depth + 1));
  }

  return hashStr(parts.join('|'));
}

/* ── Per-instance diff cache ── */
class SkeletonDiffCache {
  constructor() {
    this._cache = new Map(); // key → { hash, element }
  }

  /**
   * get(key, descriptor)
   * Returns cached React element if descriptor hash matches, else null.
   */
  get(key, descriptor) {
    const entry = this._cache.get(key);
    if (!entry) return null;
    const newHash = hashNode(descriptor);
    if (entry.hash === newHash) return entry.element;
    return null;
  }

  /**
   * set(key, descriptor, element)
   * Stores the rendered element under the descriptor's hash.
   */
  set(key, descriptor, element) {
    this._cache.set(key, { hash: hashNode(descriptor), element });
  }

  clear() { this._cache.clear(); }

  has(key) { return this._cache.has(key); }
}

module.exports = { hashNode, SkeletonDiffCache };
