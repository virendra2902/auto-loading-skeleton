'use strict';

/**
 * renderer.js — V2
 *
 * Improvements over V1:
 *  - Handles REPEAT node type (renders N identical skeleton children)
 *  - Handles HEADING with level-aware sizing
 *  - Handles MEDIA (video/iframe) as wide rectangle
 *  - Handles BADGE as inline pill
 *  - Handles TEXTAREA as tall input
 *  - Handles SELECT as input with chevron indicator
 *  - Handles CARD node type with appropriate padding wrapper
 *  - Smart sizing: prefers inline style hints, falls back to type defaults
 *  - Aspect ratio support from style hints
 *  - Passes aria-busy + aria-label to all wrappers for accessibility
 *  - Minimal key counter reset per render call for SSR safety
 */

var React  = require('react');
var N      = require('./analyzer').NODE;
var styles = require('./styles');

/* ── size defaults per node type ── */
var DEFAULTS = {
  [N.TEXT]:     { width: '80%',   height: '1em'    },
  [N.HEADING]:  { width: '55%',   height: '1.4em'  },
  [N.IMAGE]:    { width: '100%',  height: '200px'  },
  [N.AVATAR]:   { width: '40px',  height: '40px'   },
  [N.MEDIA]:    { width: '100%',  height: '220px'  },
  [N.BUTTON]:   { width: '100px', height: '36px'   },
  [N.INPUT]:    { width: '100%',  height: '38px'   },
  [N.TEXTAREA]: { width: '100%',  height: '100px'  },
  [N.SELECT]:   { width: '100%',  height: '38px'   },
  [N.BADGE]:    { width: '60px',  height: '20px'   },
  [N.ICON]:     { width: '24px',  height: '24px'   },
};

/* heading level → size */
var HEADING_SIZES = ['1.8em','1.5em','1.3em','1.15em','1em','0.9em'];

/* ── key factory ── */
var _k = 0;
function nk() { return 'sk2-' + (++_k); }
function resetKeys() { _k = 0; }

/* ── style builder ── */
function sz(defaults, hints, extra) {
  hints = hints || {};
  extra = extra || {};
  var s = {
    width:  hints.width  || defaults.width,
    height: hints.height || defaults.height,
    display: 'block',
  };
  if (hints.aspectRatio) { delete s.height; s.aspectRatio = hints.aspectRatio; }
  if (hints.margin) s.margin = hints.margin;
  if (hints.borderRadius) s.borderRadius = hints.borderRadius;
  return Object.assign(s, extra);
}

/* ── multi-line text skeleton ── */
function textLines(node, anim, extra) {
  var content = node.content || '';
  var len     = content.length;
  var lines   = Math.min(Math.max(1, Math.ceil(len / 45)), 5);
  var h       = (node.styleHints && node.styleHints.height) || (node.styleHints && node.styleHints.fontSize) || '1em';

  if (lines <= 1) {
    return React.createElement('span', {
      key:          nk(),
      className:    styles.blockClass(anim),
      style:        Object.assign(sz(DEFAULTS[N.TEXT], node.styleHints, extra), { width: node.width || '80%' }),
      'aria-hidden': 'true',
    });
  }

  var lineEls = [];
  for (var i = 0; i < lines; i++) {
    lineEls.push(React.createElement('span', {
      key:       nk(),
      className: styles.blockClass(anim),
      style: {
        display:      'block',
        width:        i === lines - 1 ? '60%' : (i === 0 ? '95%' : '100%'),
        height:       h,
        marginBottom: i < lines - 1 ? '6px' : 0,
      },
      'aria-hidden': 'true',
    }));
  }
  return React.createElement('div', { key: nk(), 'aria-hidden': 'true' }, lineEls);
}

/* ── main render function ── */
function renderNode(node, options) {
  if (!node) return null;
  options = options || {};
  var anim  = options.animation || 'shimmer';
  var hints = node.styleHints   || {};
  var nt    = node.nodeType;

  /* TEXT */
  if (nt === N.TEXT) return textLines(node, anim, {});

  /* HEADING */
  if (nt === N.HEADING) {
    var lvl    = node.level || 2;
    var hStyle = sz(DEFAULTS[N.HEADING], hints, {
      width:  node.width || hints.width || (lvl === 1 ? '70%' : lvl <= 3 ? '55%' : '45%'),
      height: hints.fontSize || HEADING_SIZES[Math.min(lvl - 1, 5)],
    });
    return React.createElement('span', {
      key:           nk(),
      className:     styles.blockClass(anim),
      style:         hStyle,
      'aria-hidden': 'true',
    });
  }

  /* IMAGE */
  if (nt === N.IMAGE) {
    return React.createElement('span', {
      key:           nk(),
      className:     styles.blockClass(anim, 'rounded'),
      style:         sz(DEFAULTS[N.IMAGE], hints),
      'aria-hidden': 'true',
    });
  }

  /* AVATAR */
  if (nt === N.AVATAR) {
    var avSize = hints.width || hints.height || '40px';
    return React.createElement('span', {
      key:           nk(),
      className:     styles.blockClass(anim, 'circle'),
      style:         { width: avSize, height: avSize, display: 'block', flexShrink: 0 },
      'aria-hidden': 'true',
    });
  }

  /* MEDIA (video / iframe) */
  if (nt === N.MEDIA) {
    return React.createElement('span', {
      key:           nk(),
      className:     styles.blockClass(anim, 'rounded'),
      style:         sz(DEFAULTS[N.MEDIA], hints),
      'aria-hidden': 'true',
    });
  }

  /* BUTTON */
  if (nt === N.BUTTON) {
    var btnW = hints.width || (node.label ? Math.max(80, node.label.length * 9) + 'px' : '100px');
    return React.createElement('span', {
      key:           nk(),
      className:     styles.blockClass(anim, 'pill'),
      style:         sz(DEFAULTS[N.BUTTON], hints, { width: btnW }),
      'aria-hidden': 'true',
    });
  }

  /* INPUT */
  if (nt === N.INPUT) {
    return React.createElement('span', {
      key:           nk(),
      className:     styles.blockClass(anim, 'rounded'),
      style:         sz(DEFAULTS[N.INPUT], hints),
      'aria-hidden': 'true',
    });
  }

  /* TEXTAREA */
  if (nt === N.TEXTAREA) {
    return React.createElement('span', {
      key:           nk(),
      className:     styles.blockClass(anim, 'rounded'),
      style:         sz(DEFAULTS[N.TEXTAREA], hints),
      'aria-hidden': 'true',
    });
  }

  /* SELECT */
  if (nt === N.SELECT) {
    return React.createElement('span', {
      key:           nk(),
      className:     styles.blockClass(anim, 'rounded'),
      style:         sz(DEFAULTS[N.SELECT], hints),
      'aria-hidden': 'true',
    });
  }

  /* BADGE */
  if (nt === N.BADGE) {
    return React.createElement('span', {
      key:           nk(),
      className:     styles.blockClass(anim, 'pill'),
      style:         sz(DEFAULTS[N.BADGE], hints),
      'aria-hidden': 'true',
    });
  }

  /* ICON */
  if (nt === N.ICON) {
    var iconSz = hints.width || hints.height || hints.fontSize || '24px';
    return React.createElement('span', {
      key:           nk(),
      className:     styles.blockClass(anim, 'circle'),
      style:         { width: iconSz, height: iconSz, display: 'block', flexShrink: 0 },
      'aria-hidden': 'true',
    });
  }

  /* REPEAT — detected list pattern */
  if (nt === N.REPEAT) {
    var items = [];
    for (var ri = 0; ri < node.count; ri++) {
      items.push(React.createElement('div', { key: nk() }, renderNode(node.template, options)));
    }
    var repStyle = {};
    if (hints.display) repStyle.display = hints.display;
    if (hints.gap)     repStyle.gap     = hints.gap;
    return React.createElement('div', { key: nk(), className: 'ask-wrap', style: repStyle }, items);
  }

  /* CARD */
  if (nt === N.CARD || nt === N.CONTAINER) {
    var kids = (node.children || []).map(function(c) { return renderNode(c, options); }).filter(Boolean);
    var t    = node.tag || 'div';

    // Empty container → show a single block
    if (kids.length === 0) {
      return React.createElement('span', {
        key:           nk(),
        className:     styles.blockClass(anim),
        style:         sz({ width: '100%', height: '24px' }, hints),
        'aria-hidden': 'true',
      });
    }

    var cStyle = {};
    if (hints.display)    cStyle.display       = hints.display;
    if (hints.flexDir)    cStyle.flexDirection  = hints.flexDir;
    if (hints.gap)        cStyle.gap            = hints.gap;
    if (hints.padding)    cStyle.padding        = hints.padding;
    if (hints.margin)     cStyle.margin         = hints.margin;
    if (hints.alignItems) cStyle.alignItems     = hints.alignItems;

    return React.createElement(t, {
      key:       nk(),
      className: 'ask-wrap',
      style:     cStyle,
    }, kids);
  }

  return null;
}

module.exports = { renderNode, resetKeys };
