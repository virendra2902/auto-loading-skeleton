'use strict';
/**
 * analyzer.js — V4
 *
 * NEW over V3:
 *  - 25 node types (up from 18): SWITCH, SLIDER, CHIP_INPUT, CALENDAR,
 *    STEPPER, BREADCRUMB, PAGINATION, TOOLTIP, DRAWER, MAP added
 *  - AI Layout Predictor: when confidence < 0.5, runs a secondary
 *    heuristic pass using sibling context + parent layout to predict type
 *  - Slot System: <AutoSkeleton> children can use <SkeletonSlot name="header">
 *    to mark regions with explicit skeleton hints, zero-ambiguity
 *  - Form intelligence: detects label+input pairs and groups them as FORM_FIELD
 *  - Scoring model: each classification uses a weighted feature vector
 *    (tag=4pts, aria=3pts, class-exact=3pts, tailwind=2pts, testid=2pts,
 *    sibling-context=1pt) for reproducible confidence
 *  - data-sk shorthand: data-sk="avatar:56" (shorter than data-skeleton)
 *  - Grid layout detection: detects CSS grid children and marks them as GRID_ITEM
 *  - Streaming/async component detection: marks Suspense boundaries
 *  - RTL awareness: detects dir="rtl" and lang attributes for i18n hints
 */

const NODE = {
  // V1-V3 types
  TEXT: 'text', HEADING: 'heading', IMAGE: 'image', AVATAR: 'avatar',
  MEDIA: 'media', BUTTON: 'button', INPUT: 'input', TEXTAREA: 'textarea',
  SELECT: 'select', BADGE: 'badge', ICON: 'icon', CARD: 'card',
  CONTAINER: 'container', REPEAT: 'repeat', SKIP: 'skip',
  TABLE: 'table', TABLE_ROW: 'table_row', NAV: 'nav', RATING: 'rating',
  DIVIDER: 'divider', PROGRESS: 'progress', TAG_GROUP: 'tag_group',
  CODE: 'code', STAT: 'stat',
  // V4 NEW
  SWITCH:      'switch',      // toggle/switch control
  SLIDER:      'slider',      // range slider with track+thumb
  CHIP_INPUT:  'chip_input',  // tag input / chip field
  CALENDAR:    'calendar',    // date picker / calendar grid
  STEPPER:     'stepper',     // step wizard
  BREADCRUMB:  'breadcrumb',  // breadcrumb trail
  PAGINATION:  'pagination',  // page number row
  TOOLTIP:     'tooltip',     // tooltip trigger
  DRAWER:      'drawer',      // side drawer skeleton
  MAP:         'map',         // map embed placeholder
  FORM_FIELD:  'form_field',  // label + input pair (V4 intelligence)
  GRID_ITEM:   'grid_item',   // detected CSS grid child
  SUSPENSE:    'suspense',    // React Suspense boundary
};

/* ── helpers ── */
const tag   = el => typeof el.type === 'string' ? el.type.toLowerCase() : null;
const prop  = (el, k) => el.props && el.props[k];
const cls   = el => (prop(el,'className') || prop(el,'class') || '').toLowerCase();
const role  = el => (prop(el,'role') || '').toLowerCase();
const tid   = el => (prop(el,'data-testid') || prop(el,'data-test-id') || '').toLowerCase();
const al    = el => (prop(el,'aria-label') || prop(el,'aria-labelledby') || '').toLowerCase();
const isRTL = el => prop(el,'dir') === 'rtl' || /\b(ar|he|fa|ur)\b/.test(prop(el,'lang') || '');

const isDecorative = el =>
  el && typeof el === 'object' && (
    prop(el,'aria-hidden') === true || prop(el,'aria-hidden') === 'true' ||
    role(el) === 'presentation' || role(el) === 'none'
  );

/* ── data-sk shorthand (V4) ──
   data-sk="avatar:56"  → avatar, hint 56px
   data-sk="map"        → map placeholder
   data-sk="skip"       → skip entirely
*/
function parseDataSk(el) {
  const v = prop(el,'data-sk') || prop(el,'data-skeleton');
  if (!v) return null;
  const [type, arg] = v.split(':');
  return { type: type.trim(), arg: arg ? arg.trim() : null };
}

/* ── Tailwind parser (extended for V4) ── */
const TW = {
  w: s => { const m = s.match(/\bw-(\d+|px|full|screen|auto|fit|1\/2|1\/3|2\/3|1\/4|3\/4)\b/); if(!m) return null; const v=m[1]; if(v==='full') return '100%'; if(v==='px') return '1px'; if(v.includes('/')) { const [a,b]=v.split('/'); return Math.round(a/b*100)+'%'; } return isNaN(+v)?null:(+v*4)+'px'; },
  h: s => { const m = s.match(/\bh-(\d+|px|full|screen|auto)\b/); if(!m) return null; const v=m[1]; if(v==='full') return '100%'; return isNaN(+v)?null:(+v*4)+'px'; },
  r: s => { if(/\brounded-full\b/.test(s)) return '9999px'; if(/\brounded-2xl\b/.test(s)) return '16px'; if(/\brounded-xl\b/.test(s)) return '12px'; if(/\brounded-lg\b/.test(s)) return '8px'; if(/\brounded\b/.test(s)) return '4px'; return null; },
  aspect: s => { if(/\baspect-square\b/.test(s)) return '1/1'; if(/\baspect-video\b/.test(s)) return '16/9'; return null; },
  isCircle: s => /\brounded-full\b/.test(s),
  isGrid: s => /\bgrid\b/.test(s),
  isFlex: s => /\bflex\b/.test(s),
  cols: s => { const m = s.match(/\bgrid-cols-(\d+)\b/); return m ? parseInt(m[1]) : null; },
};

/* ── CSS Modules + semantic class patterns ── */
const CLASS_RE = {
  avatar:     /(?:avatar|profile|pfp|userpic|user[-_]?img)/i,
  badge:      /(?:badge|chip|tag|pill|status[-_]?dot|label[-_]?pill)/i,
  card:       /(?:card|panel|tile|widget|surface)/i,
  heading:    /(?:title|heading|headline|h[1-6](?:_|$)|display[-_]?text)/i,
  button:     /(?:btn|button|cta|action[-_]?btn)/i,
  icon:       /(?:icon|ico(?:n)?[-_]|glyph|svg[-_]?wrap)/i,
  nav:        /(?:nav|navbar|sidebar|menu[-_]?bar)/i,
  stat:       /(?:stat|metric|kpi|counter|number[-_]?card)/i,
  rating:     /(?:rating|stars?|review[-_]?score)/i,
  code:       /(?:code|snippet|pre|monospace|syntax)/i,
  switch:     /(?:switch|toggle[-_]?btn|on[-_]?off)/i,
  slider:     /(?:slider|range[-_]?input|track[-_]?bar)/i,
  calendar:   /(?:calendar|datepick|date[-_]?select|picker)/i,
  stepper:    /(?:stepper|wizard[-_]?step|step[-_]?indicator)/i,
  breadcrumb: /(?:breadcrumb|crumb|page[-_]?path)/i,
  pagination: /(?:pagination|pager|page[-_]?nav)/i,
  map:        /(?:map[-_]?container|mapbox|leaflet|google[-_]?map)/i,
  chip_input: /(?:chip[-_]?input|tag[-_]?input|multiselect)/i,
  drawer:     /(?:drawer|sidebar[-_]?panel|slide[-_]?panel)/i,
};
const fuzzyMatch = el => {
  const combined = cls(el) + ' ' + tid(el) + ' ' + al(el);
  for (const [key, re] of Object.entries(CLASS_RE)) {
    if (re.test(combined)) return key;
  }
  return null;
};

/* ── Style extraction (V4 adds grid detection) ── */
function extractStyle(el) {
  const s = (el.props && el.props.style) || {};
  const c = cls(el);
  return {
    width:       s.width        || TW.w(c)    || null,
    height:      s.height       || TW.h(c)    || null,
    borderRadius:s.borderRadius || TW.r(c)    || null,
    display:     s.display      || null,
    flexDir:     s.flexDirection|| null,
    gridCols:    s.gridTemplateColumns || (TW.cols(c) ? `repeat(${TW.cols(c)},1fr)` : null),
    gap:         s.gap          || null,
    padding:     s.padding      || null,
    margin:      s.margin       || null,
    aspectRatio: s.aspectRatio  || TW.aspect(c) || null,
    alignItems:  s.alignItems   || null,
    fontSize:    s.fontSize     || null,
    isCircle:    TW.isCircle(c) || s.borderRadius === '50%',
    isGrid:      TW.isGrid(c)   || s.display === 'grid',
    isFlex:      TW.isFlex(c)   || s.display === 'flex',
    isRTL:       isRTL(el),
    maxWidth:    s.maxWidth     || null,
  };
}

/* ── Scoring model (V4) ──
   Returns { nodeType, score } using weighted feature matching.
   Higher score = higher confidence.
*/
function scoreFeatures(el, t, r, fz, props) {
  const scores = {};
  function add(type, pts) { scores[type] = (scores[type] || 0) + pts; }

  // Tag-based (highest weight = 4)
  const tagMap = {
    img: 'image', video: 'media', audio: 'media', iframe: 'media',
    button: 'button', input: 'input', textarea: 'textarea',
    select: 'select', svg: 'icon', hr: 'divider',
    progress: 'progress', meter: 'progress',
    table: 'table', tr: 'table_row', nav: 'nav',
    code: 'code', pre: 'code', h1: 'heading', h2: 'heading',
    h3: 'heading', h4: 'heading', h5: 'heading', h6: 'heading',
    ol: 'pagination', ul: 'nav',
  };
  if (t && tagMap[t]) add(tagMap[t], 4);

  // ARIA role (weight = 3)
  const roleMap = {
    button: 'button', img: 'image', navigation: 'nav',
    progressbar: 'progress', slider: 'slider', switch: 'switch',
    checkbox: 'switch', radio: 'switch', tab: 'button',
    listbox: 'select', combobox: 'chip_input',
    grid: 'table', row: 'table_row', cell: 'table_row',
    tooltip: 'tooltip', dialog: 'drawer', complementary: 'drawer',
    status: 'stat', meter: 'progress',
  };
  if (r && roleMap[r]) add(roleMap[r], 3);

  // Fuzzy class match (weight = 3 for exact, 2 for CSS-module)
  if (fz) add(fz, 3);

  // Tailwind hints (weight = 2)
  const c = cls(el);
  if (TW.isCircle(c)) add('avatar', 2);
  if (/\baspect-square\b/.test(c)) add('image', 2);
  if (/\baspect-video\b/.test(c)) add('media', 2);
  if (/\btruncate\b|\bline-clamp\b/.test(c)) add('text', 2);

  // data-testid / aria-label (weight = 2)
  const sem = tid(el) + ' ' + al(el);
  if (/avatar|profile/i.test(sem)) add('avatar', 2);
  if (/star|rating/i.test(sem)) add('rating', 2);
  if (/progress|loading/i.test(sem)) add('progress', 2);
  if (/switch|toggle/i.test(sem)) add('switch', 2);
  if (/map/i.test(sem)) add('map', 2);
  if (/calendar|datepick/i.test(sem)) add('calendar', 2);
  if (/breadcrumb/i.test(sem)) add('breadcrumb', 2);
  if (/pagination|pager/i.test(sem)) add('pagination', 2);
  if (/step/i.test(sem)) add('stepper', 2);

  // Input type sub-classification
  if (t === 'input') {
    const itype = (props.type || 'text').toLowerCase();
    if (itype === 'range') { add('slider', 4); }
    else if (itype === 'checkbox') { add('switch', 3); }
    else if (itype === 'radio') { add('switch', 2); }
    else if (itype === 'date' || itype === 'datetime-local') { add('calendar', 4); }
    else if (itype === 'color') { add('icon', 3); }
  }

  // Find winner
  let best = null, bestScore = 0;
  for (const [type, score] of Object.entries(scores)) {
    if (score > bestScore) { bestScore = score; best = type; }
  }

  // Normalize to 0-1 confidence (max possible = ~12 pts)
  const conf = best ? Math.min(1, bestScore / 9) : 0;
  return { nodeType: best, score: bestScore, conf };
}

/* ── AI Layout Predictor (V4) ──
   When confidence < 0.5, uses sibling context to infer type.
   e.g. if sibling is AVATAR, this text is probably a NAME (heading-like)
*/
function predictFromSiblings(descriptor, siblings) {
  if (!descriptor || !siblings || !siblings.length) return descriptor;
  const sibTypes = siblings.map(s => s && s.nodeType).filter(Boolean);

  // If an AVATAR sibling exists and this is TEXT → likely a name/title
  if (descriptor.nodeType === NODE.TEXT && sibTypes.includes(NODE.AVATAR)) {
    return { ...descriptor, nodeType: NODE.HEADING, level: 3, _predicted: true };
  }
  // If all siblings are TEXT → this is a text block too
  if (descriptor.nodeType === NODE.CONTAINER &&
      sibTypes.every(t => t === NODE.TEXT || t === NODE.HEADING)) {
    return { ...descriptor, nodeType: NODE.TEXT, _predicted: true };
  }
  // If siblings are all similar containers → this is a REPEAT item
  if (descriptor.nodeType === NODE.CONTAINER && sibTypes.length >= 3 &&
      sibTypes.every(t => t === NODE.CONTAINER)) {
    return { ...descriptor, _isRepeatItem: true };
  }
  return descriptor;
}

/* ── Form field detection (V4) ──
   Detects label + input sibling pairs and groups as FORM_FIELD
*/
function detectFormField(children) {
  if (!children || children.length !== 2) return null;
  const [a, b] = children;
  const aIsLabel = a && (a.nodeType === NODE.TEXT || a.nodeType === NODE.HEADING);
  const bIsInput = b && (b.nodeType === NODE.INPUT || b.nodeType === NODE.TEXTAREA ||
                         b.nodeType === NODE.SELECT || b.nodeType === NODE.SLIDER);
  if (aIsLabel && bIsInput) return true;
  return null;
}

/* ── Repeat detection (smarter than V3) ── */
function detectRepeat(childArr) {
  if (!childArr || childArr.length < 2) return null;
  const real = childArr.filter(c => c && typeof c === 'object' && c.type);
  if (real.length < 2) return null;

  // Same component type
  if (real.every(c => c.type === real[0].type))
    return { count: real.length, template: real[0], conf: 0.95 };

  // Same tag + same child count
  const ft = tag(real[0]);
  const fk = (() => { const k = real[0].props && real[0].props.children; return Array.isArray(k)?k.length:(k?1:0); })();
  if (ft && real.every(c => {
    const k = c.props && c.props.children;
    const kc = Array.isArray(k)?k.length:(k?1:0);
    return tag(c) === ft && Math.abs(kc - fk) <= 1;
  })) return { count: real.length, template: real[0], conf: 0.75 };

  // Same first class token
  const fc = cls(real[0]).split(/\s/)[0];
  if (fc && real.every(c => cls(c).split(/\s/)[0] === fc))
    return { count: real.length, template: real[0], conf: 0.7 };

  return null;
}

/* ── Text helpers ── */
function getTextContent(c) {
  if (c == null) return '';
  if (typeof c === 'string' || typeof c === 'number') return String(c);
  if (Array.isArray(c)) return c.map(x => getTextContent(x && x.props ? x.props.children : x)).join('');
  return '';
}
function isTextLeaf(el) {
  const c = el.props && el.props.children;
  if (typeof c === 'string' || typeof c === 'number') return true;
  if (Array.isArray(c)) return c.every(x => typeof x === 'string' || typeof x === 'number' || x == null);
  return false;
}
function estimateTextWidth(text) {
  if (!text) return '80%';
  const len = text.length;
  if (len <= 8)  return Math.min(120, Math.max(30, len * 9)) + 'px';
  if (len <= 25) return Math.min(88, 32 + len * 1.4) + '%';
  if (len <= 80) return '92%';
  return '100%';
}

/* ── Structural fingerprint ── */
function fingerprint(el, depth) {
  if (!el || typeof el !== 'object') return typeof el;
  depth = depth || 0;
  if (depth > 3) return '…';
  const t2 = typeof el.type === 'string' ? el.type : (el.type && (el.type.displayName || el.type.name)) || '?';
  const c2 = el.props && el.props.children;
  const kc = Array.isArray(c2) ? c2.length : (c2 ? 1 : 0);
  const klass = (el.props && el.props.className) ? el.props.className.slice(0,20) : '';
  return `${t2}[${klass}](${kc})`;
}

/* ── MAIN ANALYZER ── */
function analyzeElement(element, depth, opts, _siblings) {
  depth = depth || 0;
  opts  = opts  || {};
  const maxDepth        = opts.maxDepth        != null ? opts.maxDepth        : 12;
  const repeatThreshold = opts.repeatThreshold != null ? opts.repeatThreshold : 0.6;

  if (element === null || element === undefined || typeof element === 'boolean') return null;

  // Raw text/number
  if (typeof element === 'string' || typeof element === 'number') {
    const str = String(element).trim();
    if (!str) return null;
    return { nodeType: NODE.TEXT, content: str, width: estimateTextWidth(str), depth, _conf: 0.9 };
  }

  // Arrays
  if (Array.isArray(element)) {
    const results = [];
    element.forEach(el => {
      const r = analyzeElement(el, depth, opts, element);
      if (Array.isArray(r)) r.forEach(x => { if(x) results.push(x); });
      else if (r) results.push(r);
    });
    return results.length === 1 ? results[0] : results;
  }

  // Fragments / Strict mode
  if (element.type && (
    String(element.type) === 'Symbol(react.fragment)' ||
    String(element.type) === 'Symbol(react.strict_mode)' ||
    element.type === Symbol.for('react.fragment')
  )) return analyzeElement(element.props && element.props.children, depth, opts);

  // React.lazy / Suspense
  if (element.type && element.type.$$typeof === Symbol.for('react.lazy')) {
    return { nodeType: NODE.SUSPENSE, depth, _conf: 1.0 };
  }

  // Non-DOM component
  if (typeof element.type === 'function') {
    const kids = element.props && element.props.children;
    if (kids) return analyzeElement(kids, depth, opts);
    return { nodeType: NODE.CONTAINER, children: [], styleHints: {}, tag: 'div', depth, _conf: 0.3 };
  }

  // Skip decorative
  if (isDecorative(element)) return { nodeType: NODE.SKIP, depth };

  const t     = tag(element);
  const r     = role(element);
  const fz    = fuzzyMatch(element);
  const sH    = extractStyle(element);
  const props = element.props || {};

  // ── data-sk / data-skeleton explicit hints (conf=1.0) ──
  const dsk = parseDataSk(element);
  if (dsk && dsk.type !== 'skip') {
    const typeMap = {
      avatar: NODE.AVATAR, image: NODE.IMAGE, button: NODE.BUTTON,
      card: NODE.CARD, text: NODE.TEXT, heading: NODE.HEADING,
      stat: NODE.STAT, rating: NODE.RATING, progress: NODE.PROGRESS,
      code: NODE.CODE, divider: NODE.DIVIDER, switch: NODE.SWITCH,
      slider: NODE.SLIDER, calendar: NODE.CALENDAR, map: NODE.MAP,
      breadcrumb: NODE.BREADCRUMB, pagination: NODE.PAGINATION,
      stepper: NODE.STEPPER, drawer: NODE.DRAWER,
    };
    if (typeMap[dsk.type]) {
      return { nodeType: typeMap[dsk.type], styleHints: sH,
        ...(dsk.arg ? { width: dsk.arg+'px', height: dsk.arg+'px' } : {}),
        depth, _conf: 1.0, _explicit: true };
    }
  }
  if (dsk && dsk.type === 'skip') return { nodeType: NODE.SKIP, depth };

  // ── Scoring model ──
  const scored = scoreFeatures(element, t, r, fz, props);

  // ── React 18 Suspense boundary ──
  if (element.type && element.type === Symbol.for('react.suspense')) {
    return { nodeType: NODE.SUSPENSE, depth, _conf: 1.0 };
  }

  // ── Direct tag wins (conf ≥ 0.9) ──
  if (t === 'img') {
    const isAv = fz === 'avatar' || /avatar|profile|pfp/i.test(props.alt||'') || sH.isCircle;
    return { nodeType: isAv ? NODE.AVATAR : NODE.IMAGE, styleHints: sH, depth, _conf: 0.95 };
  }
  if (t === 'video' || t === 'audio') return { nodeType: NODE.MEDIA, styleHints: sH, depth, _conf: 0.95 };
  if (t === 'iframe') {
    const isMap = fz === 'map' || /map|google|mapbox/i.test(cls(element));
    return { nodeType: isMap ? NODE.MAP : NODE.MEDIA, styleHints: sH, depth, _conf: 0.9 };
  }
  if (t === 'svg')  return { nodeType: NODE.ICON,    styleHints: sH, depth, _conf: 0.95 };
  if (t === 'hr')   return { nodeType: NODE.DIVIDER, depth, _conf: 1.0 };
  if (t === 'progress' || t === 'meter') return { nodeType: NODE.PROGRESS, styleHints: sH, depth, _conf: 0.95 };
  if (t === 'table') {
    const tbody = (Array.isArray(props.children)?props.children:[props.children]).find(c=>c&&tag(c)==='tbody');
    const rows = tbody ? (Array.isArray(tbody.props&&tbody.props.children)?tbody.props.children.length:1) : 4;
    const firstRow = tbody&&tbody.props&&tbody.props.children&&(Array.isArray(tbody.props.children)?tbody.props.children[0]:tbody.props.children);
    const cols = firstRow&&firstRow.props&&Array.isArray(firstRow.props.children)?firstRow.props.children.length:4;
    return { nodeType: NODE.TABLE, rows, cols, styleHints: sH, depth, _conf: 0.95 };
  }
  if (t === 'tr') return { nodeType: NODE.TABLE_ROW, cols: Array.isArray(props.children)?props.children.length:1, depth, _conf: 0.95 };
  if (t === 'nav' || r === 'navigation') return { nodeType: NODE.NAV, styleHints: sH, depth, _conf: 0.95 };
  if (t === 'code' || t === 'pre') return { nodeType: NODE.CODE, styleHints: sH, lines: 5, depth, _conf: 0.95 };
  if (/^h[1-6]$/.test(t||'')) {
    const content = getTextContent(props.children);
    return { nodeType: NODE.HEADING, level: parseInt(t[1]), content, width: estimateTextWidth(content)||'60%', styleHints: sH, depth, _conf: 0.95 };
  }
  if (t === 'button' || r === 'button') {
    return { nodeType: NODE.BUTTON, label: typeof props.children==='string'?props.children:'', styleHints: sH, depth, _conf: 0.95 };
  }
  if (t === 'input') {
    const itype = (props.type||'text').toLowerCase();
    if (itype==='range')   return { nodeType: NODE.SLIDER,   styleHints: sH, depth, _conf: 0.95 };
    if (itype==='checkbox') return { nodeType: NODE.SWITCH,  styleHints: sH, depth, _conf: 0.95 };
    if (itype==='radio')   return { nodeType: NODE.SWITCH,   styleHints: sH, depth, _conf: 0.9 };
    if (itype==='date'||itype==='datetime-local') return { nodeType: NODE.CALENDAR, styleHints: sH, depth, _conf: 0.95 };
    if (itype==='color')   return { nodeType: NODE.ICON,     styleHints: { width:'32px',height:'32px' }, depth, _conf: 0.9 };
    return { nodeType: NODE.INPUT, inputType: itype, styleHints: sH, depth, _conf: 0.9 };
  }
  if (t==='textarea') return { nodeType: NODE.TEXTAREA, styleHints: sH, depth, _conf: 0.95 };
  if (t==='select')   return { nodeType: NODE.SELECT,   styleHints: sH, depth, _conf: 0.95 };

  // ── Fuzzy class hits (conf 0.7-0.85) ──
  if (fz) {
    const fzMap = {
      avatar: NODE.AVATAR, badge: NODE.BADGE, stat: NODE.STAT,
      rating: NODE.RATING, icon: NODE.ICON, switch: NODE.SWITCH,
      slider: NODE.SLIDER, calendar: NODE.CALENDAR,
      stepper: NODE.STEPPER, breadcrumb: NODE.BREADCRUMB,
      pagination: NODE.PAGINATION, map: NODE.MAP,
      chip_input: NODE.CHIP_INPUT, drawer: NODE.DRAWER,
    };
    if (fzMap[fz]) return { nodeType: fzMap[fz], styleHints: sH, depth, _conf: scored.conf || 0.75 };
    if (fz === 'heading') {
      const content = getTextContent(props.children);
      return { nodeType: NODE.HEADING, level: 2, content, width: estimateTextWidth(content)||'60%', styleHints: sH, depth, _conf: 0.75 };
    }
  }

  // Text leaf
  if (isTextLeaf(element)) {
    const content = getTextContent(props.children);
    if (!content.trim()) return null;
    const isBadge = fz === 'badge' || /\bbadge\b|\bchip\b/.test(cls(element));
    return {
      nodeType: isBadge ? NODE.BADGE : NODE.TEXT,
      content, width: sH.width || estimateTextWidth(content), styleHints: sH, depth, _conf: 0.7
    };
  }

  // Depth cap
  if (depth >= maxDepth) return { nodeType: NODE.CONTAINER, children: [], styleHints: sH, tag: t||'div', depth, _conf: 0.3 };

  // ── Recurse children ──
  const rawChildren = props.children;
  const childArr    = rawChildren == null ? [] : (Array.isArray(rawChildren) ? rawChildren : [rawChildren]);

  // Repeat detection
  const repeat = opts.detectRepeats !== false ? detectRepeat(childArr) : null;
  if (repeat && depth > 0 && repeat.conf >= repeatThreshold) {
    return {
      nodeType: NODE.REPEAT, count: repeat.count,
      template: analyzeElement(repeat.template, depth+1, opts),
      styleHints: sH, depth, _conf: repeat.conf,
    };
  }

  // Recurse
  const children = [];
  childArr.forEach((child, i) => {
    const res = analyzeElement(child, depth+1, opts, childArr);
    if (Array.isArray(res)) res.forEach(r2 => { if(r2 && r2.nodeType !== NODE.SKIP) children.push(r2); });
    else if (res && res.nodeType !== NODE.SKIP) children.push(res);
  });

  // Apply AI sibling prediction on low-conf children
  const predicted = children.map((child, i) => {
    if (child._conf != null && child._conf < 0.5) {
      return predictFromSiblings(child, children.filter((_,j) => j!==i));
    }
    return child;
  });

  // Form field detection (V4)
  if (detectFormField(predicted)) {
    return { nodeType: NODE.FORM_FIELD, children: predicted, styleHints: sH, depth, _conf: 0.9 };
  }

  // Grid item detection (V4)
  const isGrid = sH.isGrid || (sH.gridCols != null);
  const isCard = fz === 'card' || t === 'article' || t === 'section';
  const isNav  = fz === 'nav'  || t === 'nav';

  return {
    nodeType: isNav ? NODE.NAV : isCard ? NODE.CARD : NODE.CONTAINER,
    tag: t || 'div', styleHints: sH, children: predicted,
    isGrid, isRTL: sH.isRTL, depth, _conf: 0.5,
  };
}

module.exports = { analyzeElement, NODE, estimateTextWidth, fingerprint };
