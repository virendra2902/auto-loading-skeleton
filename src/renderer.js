const React = require('react');
const { ELEMENT_TYPES } = require('./analyzer');
const { blockClass } = require('./styles');

const DEFAULTS = {
  text:    { width: '80%',  height: '1em'   },
  heading: { width: '60%',  height: '1.4em' },
  image:   { width: '100%', height: '200px' },
  avatar:  { width: '40px', height: '40px'  },
  button:  { width: '100px',height: '36px'  },
  input:   { width: '100%', height: '38px'  },
  icon:    { width: '24px', height: '24px'  },
};

let _key = 0;
function nk() { return 'ask-' + (++_key); }

function bStyle(def, hints, extra) {
  hints = hints || {};
  extra = extra || {};
  return Object.assign({ width: hints.width || def.width, height: hints.height || def.height, display: 'block', margin: hints.margin || '0' }, extra);
}

function renderNode(node, options) {
  if (!node) return null;
  options = options || {};
  var animation = options.animation || 'shimmer';
  var nodeType = node.nodeType;
  var hints = node.styleHints || {};

  if (nodeType === ELEMENT_TYPES.TEXT) {
    var isHeading = node.isHeading;
    var def = isHeading ? DEFAULTS.heading : DEFAULTS.text;
    var len = (node.content || '').length;
    var lines = Math.min(Math.max(1, Math.round(len / 40)), 4);
    if (lines <= 1) {
      return React.createElement('span', { key: nk(), className: blockClass(animation), style: bStyle(def, hints, { width: hints.width || (len > 60 ? '95%' : def.width) }), 'aria-hidden': 'true' });
    }
    var lineEls = [];
    for (var i = 0; i < lines; i++) {
      lineEls.push(React.createElement('span', { key: nk(), className: blockClass(animation), style: { display: 'block', width: i === lines-1 ? '65%' : '100%', height: def.height, marginBottom: '6px' }, 'aria-hidden': 'true' }));
    }
    return React.createElement('div', { key: nk() }, lineEls);
  }

  if (nodeType === ELEMENT_TYPES.IMAGE) {
    return React.createElement('span', { key: nk(), className: blockClass(animation, 'rounded'), style: bStyle(DEFAULTS.image, hints), 'aria-hidden': 'true' });
  }

  if (nodeType === ELEMENT_TYPES.AVATAR) {
    return React.createElement('span', { key: nk(), className: blockClass(animation, 'circle'), style: bStyle(DEFAULTS.avatar, hints), 'aria-hidden': 'true' });
  }

  if (nodeType === ELEMENT_TYPES.ICON) {
    return React.createElement('span', { key: nk(), className: blockClass(animation, 'circle'), style: bStyle(DEFAULTS.icon, hints), 'aria-hidden': 'true' });
  }

  if (nodeType === ELEMENT_TYPES.BUTTON) {
    return React.createElement('span', { key: nk(), className: blockClass(animation, 'pill'), style: bStyle(DEFAULTS.button, hints), 'aria-hidden': 'true' });
  }

  if (nodeType === ELEMENT_TYPES.INPUT) {
    return React.createElement('span', { key: nk(), className: blockClass(animation, 'rounded'), style: bStyle(DEFAULTS.input, hints), 'aria-hidden': 'true' });
  }

  if (nodeType === ELEMENT_TYPES.CONTAINER) {
    var children = (node.children || []).map(function(c) { return renderNode(c, options); }).filter(Boolean);
    var tag = node.tag || 'div';
    var cStyle = {};
    if (hints.display) cStyle.display = hints.display;
    if (hints.flexDirection) cStyle.flexDirection = hints.flexDirection;
    if (hints.gap) cStyle.gap = hints.gap;
    if (hints.padding) cStyle.padding = hints.padding;
    if (hints.margin) cStyle.margin = hints.margin;
    if (children.length === 0) {
      return React.createElement('span', { key: nk(), className: blockClass(animation), style: bStyle({ width: '100%', height: '20px' }, hints), 'aria-hidden': 'true' });
    }
    return React.createElement(tag, { key: nk(), style: cStyle, className: 'ask-wrapper' }, children);
  }

  return null;
}

module.exports = { renderNode };
