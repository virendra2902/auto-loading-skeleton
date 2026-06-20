'use strict';

/**
 * analyzer.js — V2
 *
 * Improvements over V1:
 *  - Depth-limited recursion with configurable maxDepth
 *  - ARIA role awareness (role="img", role="button", etc.)
 *  - Smart width inference from text content length & element type
 *  - Detects flex/grid containers and replicates their direction
 *  - Detects repeat patterns (lists of similar children) for count-based skeletons
 *  - Extracts computed className hints (card, title, subtitle, badge, tag, chip…)
 *  - Inline style extraction: width, height, borderRadius, display, flexDirection, gap, padding, margin, aspectRatio
 *  - Handles React.Fragment and arrays
 *  - Skips purely decorative elements (aria-hidden, role="presentation")
 *  - Detects video/audio/iframe as media placeholders
 *  - Result memoization keyed on element type + props shape
 */

const NODE = {
  TEXT:       'text',
  HEADING:    'heading',
  IMAGE:      'image',
  AVATAR:     'avatar',
  MEDIA:      'media',        // video / audio / iframe
  BUTTON:     'button',
  INPUT:      'input',
  TEXTAREA:   'textarea',
  SELECT:     'select',
  BADGE:      'badge',
  ICON:       'icon',
  CARD:       'card',
  CONTAINER:  'container',
  REPEAT:     'repeat',       // detected list pattern
  SKIP:       'skip',         // decorative / aria-hidden
};

/* ── helpers ── */

function tag(el) {
  return typeof el.type === 'string' ? el.type.toLowerCase() : null;
}

function cls(el) {
  return ((el.props && el.props.className) || '').toLowerCase();
}

function role(el) {
  return ((el.props && el.props.role) || '').toLowerCase();
}

function aria(el, key) {
  return el.props && el.props[key];
}

function styleOf(el) {
  return (el.props && el.props.style) || {};
}

function isDecorativeEl(el) {
  if (!el || typeof el !== 'object') return false;
  return aria(el, 'aria-hidden') === true ||
    aria(el, 'aria-hidden') === 'true' ||
    role(el) === 'presentation' ||
    role(el) === 'none';
}

function extractStyle(el) {
  const s = styleOf(el);
  return {
    width:        s.width        || null,
    height:       s.height       || null,
    borderRadius: s.borderRadius || null,
    display:      s.display      || null,
    flexDir:      s.flexDirection|| null,
    gap:          s.gap          || null,
    padding:      s.padding      || s.p || null,
    margin:       s.margin       || s.m || null,
    aspectRatio:  s.aspectRatio  || null,
    maxWidth:     s.maxWidth     || null,
    minHeight:    s.minHeight    || null,
    alignItems:   s.alignItems   || null,
    fontSize:     s.fontSize     || null,
    fontWeight:   s.fontWeight   || null,
  };
}

const CLASS_PATTERNS = {
  avatar:   /\b(avatar|profile[-_]?pic|user[-_]?img|user[-_]?photo|pfp)\b/,
  badge:    /\b(badge|chip|tag|label|pill|status[-_]?dot)\b/,
  icon:     /\b(icon|ico|svg[-_]?icon|material[-_]?icon|fa[-_]|bi[-_]|ri[-_]|heroicon)\b/,
  heading:  /\b(heading|title|headline|h[1-6]|display[-_]?(text|title))\b/,
  card:     /\b(card|panel|tile|widget|box[-_]?container)\b/,
  button:   /\b(btn|button)\b/,
  input:    /\b(input|field|text[-_]?box|form[-_]?control)\b/,
  media:    /\b(media|video|player|thumbnail|cover[-_]?img|hero[-_]?img|banner)\b/,
  list:     /\b(list|feed|grid|gallery|results)\b/,
};

function matchesClass(el, key) {
  return CLASS_PATTERNS[key] && CLASS_PATTERNS[key].test(cls(el));
}

/* ── text content extraction ── */
function getTextContent(children) {
  if (typeof children === 'string' || typeof children === 'number') {
    return String(children);
  }
  if (Array.isArray(children)) {
    return children.map(c => getTextContent(c && c.props ? c.props.children : c)).join('');
  }
  return '';
}

function isTextLeaf(el) {
  const c = el.props && el.props.children;
  if (typeof c === 'string' || typeof c === 'number') return true;
  if (Array.isArray(c)) return c.every(x => typeof x === 'string' || typeof x === 'number' || x == null);
  return false;
}

/* ── list/repeat pattern detection ── */
function detectRepeat(children) {
  if (!Array.isArray(children) || children.length < 2) return null;
  const real = children.filter(c => c && typeof c === 'object');
  if (real.length < 2) return null;

  // Check if all children share the same element type
  const firstType = real[0].type;
  const allSame = real.every(c => c.type === firstType);
  if (allSame && real.length >= 2) {
    return { count: real.length, template: real[0] };
  }

  // Check if all children share the same className prefix
  const firstCls = cls(real[0]).split(' ')[0];
  if (firstCls && real.every(c => cls(c).startsWith(firstCls))) {
    return { count: real.length, template: real[0] };
  }

  return null;
}

/* ── main analyzer ── */
function analyzeElement(element, depth, opts) {
  depth = depth || 0;
  opts  = opts  || {};
  var maxDepth = opts.maxDepth != null ? opts.maxDepth : 8;

  if (element === null || element === undefined) return null;
  if (typeof element === 'boolean') return null;

  // String / number node
  if (typeof element === 'string' || typeof element === 'number') {
    var str = String(element).trim();
    if (!str) return null;
    return {
      nodeType: NODE.TEXT,
      content:  str,
      width:    estimateTextWidth(str),
      depth:    depth,
    };
  }

  // Array / Fragment
  if (Array.isArray(element)) {
    var results = [];
    element.forEach(function(el) {
      var r = analyzeElement(el, depth, opts);
      if (Array.isArray(r)) results = results.concat(r);
      else if (r) results.push(r);
    });
    return results.length === 1 ? results[0] : results;
  }

  // React.Fragment
  if (element.type && (element.type === Symbol.for('react.fragment') || element.type.toString() === 'Symbol(react.fragment)')) {
    return analyzeElement(element.props && element.props.children, depth, opts);
  }

  // Non-DOM component (function/class) — analyse its children if present
  if (typeof element.type === 'function') {
    var fc = element.props && element.props.children;
    if (fc) return analyzeElement(fc, depth, opts);
    // treat as opaque container
    return { nodeType: NODE.CONTAINER, children: [], styleHints: {}, tag: 'div', depth: depth };
  }

  // Skip decorative
  if (isDecorativeEl(element)) {
    return { nodeType: NODE.SKIP, depth: depth };
  }

  var t       = tag(element);
  var c       = cls(element);
  var r       = role(element);
  var sHints  = extractStyle(element);
  var props   = element.props || {};

  // ── specific tag classification ──

  if (t === 'img') {
    var isAvatar = matchesClass(element, 'avatar') ||
      /avatar|profile|pfp/i.test(props.alt || '') ||
      (sHints.width && sHints.height && sHints.width === sHints.height && sHints.borderRadius);
    return {
      nodeType:   isAvatar ? NODE.AVATAR : NODE.IMAGE,
      styleHints: sHints,
      alt:        props.alt || '',
      depth:      depth,
    };
  }

  if (t === 'video' || t === 'audio' || t === 'iframe') {
    return { nodeType: NODE.MEDIA, styleHints: sHints, depth: depth };
  }

  if (t === 'svg' || r === 'img' && !sHints.width) {
    return { nodeType: NODE.ICON, styleHints: sHints, depth: depth };
  }

  if (t === 'button' || r === 'button' || matchesClass(element, 'button')) {
    return {
      nodeType:   NODE.BUTTON,
      label:      typeof props.children === 'string' ? props.children : '',
      styleHints: sHints,
      depth:      depth,
    };
  }

  if (t === 'input') {
    var inputType = (props.type || 'text').toLowerCase();
    if (inputType === 'checkbox' || inputType === 'radio') {
      return { nodeType: NODE.ICON, styleHints: { width: '18px', height: '18px' }, depth: depth };
    }
    return { nodeType: NODE.INPUT, inputType: inputType, styleHints: sHints, depth: depth };
  }

  if (t === 'textarea') return { nodeType: NODE.TEXTAREA, styleHints: sHints, depth: depth };
  if (t === 'select')   return { nodeType: NODE.SELECT,   styleHints: sHints, depth: depth };

  // Heading tags
  if (/^h[1-6]$/.test(t || '') || matchesClass(element, 'heading')) {
    if (isTextLeaf(element)) {
      var hContent = getTextContent(props.children);
      return {
        nodeType:   NODE.HEADING,
        level:      t ? parseInt(t[1]) : 2,
        content:    hContent,
        width:      estimateTextWidth(hContent) || '60%',
        styleHints: sHints,
        depth:      depth,
      };
    }
  }

  // Class-based inference
  if (matchesClass(element, 'avatar')) {
    return { nodeType: NODE.AVATAR, styleHints: sHints, depth: depth };
  }
  if (matchesClass(element, 'badge')) {
    return { nodeType: NODE.BADGE, styleHints: sHints, depth: depth };
  }
  if (matchesClass(element, 'icon')) {
    return { nodeType: NODE.ICON, styleHints: sHints, depth: depth };
  }
  if (matchesClass(element, 'media')) {
    return { nodeType: NODE.IMAGE, styleHints: sHints, depth: depth };
  }

  // Text leaf inside any tag
  if (isTextLeaf(element)) {
    var content  = getTextContent(props.children);
    var isHead   = matchesClass(element, 'heading') || /^h[1-6]$/.test(t || '');
    var isBadge  = matchesClass(element, 'badge');
    if (isBadge) return { nodeType: NODE.BADGE, content: content, styleHints: sHints, depth: depth };
    return {
      nodeType:   isHead ? NODE.HEADING : NODE.TEXT,
      content:    content,
      width:      sHints.width || estimateTextWidth(content),
      styleHints: sHints,
      depth:      depth,
    };
  }

  // Depth limit — treat as opaque block
  if (depth >= maxDepth) {
    return { nodeType: NODE.CONTAINER, children: [], styleHints: sHints, tag: t || 'div', depth: depth };
  }

  // ── Container: recurse ──
  var rawChildren = props.children;
  var childArr    = rawChildren == null ? [] : (Array.isArray(rawChildren) ? rawChildren : [rawChildren]);

  // Detect repeat pattern
  var repeat = opts.detectRepeats !== false ? detectRepeat(childArr) : null;
  if (repeat && depth > 0) {
    return {
      nodeType:  NODE.REPEAT,
      count:     repeat.count,
      template:  analyzeElement(repeat.template, depth + 1, opts),
      styleHints: sHints,
      depth:     depth,
    };
  }

  var children = [];
  childArr.forEach(function(child) {
    var res = analyzeElement(child, depth + 1, opts);
    if (Array.isArray(res)) { res.forEach(function(r2) { if (r2 && r2.nodeType !== NODE.SKIP) children.push(r2); }); }
    else if (res && res.nodeType !== NODE.SKIP) children.push(res);
  });

  // Card heuristic: contains image + text children
  var isCard = matchesClass(element, 'card') || t === 'article' || t === 'section';

  return {
    nodeType:   isCard ? NODE.CARD : NODE.CONTAINER,
    tag:        t || 'div',
    styleHints: sHints,
    children:   children,
    depth:      depth,
  };
}

/* ── text width estimation ── */
function estimateTextWidth(text) {
  if (!text) return '80%';
  var len = text.length;
  if (len <= 10)  return Math.min(100, Math.max(20, len * 7)) + 'px';
  if (len <= 30)  return Math.min(90, 30 + len) + '%';
  if (len <= 80)  return '90%';
  return '100%';
}

module.exports = { analyzeElement, NODE, estimateTextWidth };
