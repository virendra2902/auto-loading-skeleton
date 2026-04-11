const ELEMENT_TYPES = {
  TEXT:      'text',
  IMAGE:     'image',
  AVATAR:    'avatar',
  BUTTON:    'button',
  INPUT:     'input',
  CONTAINER: 'container',
  ICON:      'icon',
};

function inferType(element) {
  if (!element || typeof element !== 'object') return ELEMENT_TYPES.TEXT;
  var type = element.type;
  var props = element.props || {};
  var tag = typeof type === 'string' ? type.toLowerCase() : '';
  var cls = (props.className || '').toLowerCase();
  var alt = (props.alt || '').toLowerCase();
  var role = (props.role || '').toLowerCase();

  if (tag === 'img') {
    var isAvatar = cls.includes('avatar') || cls.includes('profile') || alt.includes('avatar');
    return isAvatar ? ELEMENT_TYPES.AVATAR : ELEMENT_TYPES.IMAGE;
  }
  if (tag === 'button' || role === 'button') return ELEMENT_TYPES.BUTTON;
  if (tag === 'input' || tag === 'textarea' || tag === 'select') return ELEMENT_TYPES.INPUT;
  if (tag === 'svg' || cls.includes('icon')) return ELEMENT_TYPES.ICON;
  if (cls.includes('avatar') || cls.includes('profile-pic')) return ELEMENT_TYPES.AVATAR;
  return ELEMENT_TYPES.CONTAINER;
}

function isTextLeaf(element) {
  if (!element || typeof element !== 'object') return false;
  var children = element.props && element.props.children;
  if (typeof children === 'string') return true;
  if (typeof children === 'number') return true;
  if (Array.isArray(children)) {
    return children.every(function(c) { return typeof c === 'string' || typeof c === 'number'; });
  }
  return false;
}

function extractStyleHints(element) {
  var props = (element && element.props) || {};
  var style = props.style || {};
  return {
    width: style.width,
    height: style.height,
    borderRadius: style.borderRadius,
    display: style.display,
    flexDirection: style.flexDirection,
    alignItems: style.alignItems,
    gap: style.gap,
    padding: style.padding,
    margin: style.margin,
  };
}

function analyzeElement(element, depth) {
  depth = depth || 0;
  if (element === null || element === undefined) return null;
  if (typeof element === 'string' || typeof element === 'number') {
    return { nodeType: ELEMENT_TYPES.TEXT, content: String(element), depth: depth };
  }
  if (typeof element === 'boolean') return null;

  if (Array.isArray(element)) {
    return element.map(function(el) { return analyzeElement(el, depth); }).filter(Boolean);
  }

  var type = element.type;
  var props = element.props || {};
  var styleHints = extractStyleHints(element);

  // Structural elements take priority over text-leaf detection
  var earlyType = inferType(element);
  if (earlyType === ELEMENT_TYPES.BUTTON || earlyType === ELEMENT_TYPES.INPUT) {
    var lbl = earlyType === ELEMENT_TYPES.BUTTON && typeof props.children === 'string' ? props.children : '';
    return { nodeType: earlyType, label: lbl, styleHints: styleHints, depth: depth };
  }

  if (isTextLeaf(element)) {
    var tag = typeof type === 'string' ? type.toLowerCase() : '';
    var isHeading = /^h[1-6]$/.test(tag);
    return { nodeType: ELEMENT_TYPES.TEXT, isHeading: isHeading, tag: tag, content: String(props.children), styleHints: styleHints, depth: depth };
  }

  var nodeType = inferType(element);

  if (nodeType === ELEMENT_TYPES.IMAGE || nodeType === ELEMENT_TYPES.AVATAR || nodeType === ELEMENT_TYPES.ICON) {
    return { nodeType: nodeType, styleHints: styleHints, depth: depth };
  }
  if (nodeType === ELEMENT_TYPES.BUTTON) {
    return { nodeType: ELEMENT_TYPES.BUTTON, label: typeof props.children === 'string' ? props.children : '', styleHints: styleHints, depth: depth };
  }
  if (nodeType === ELEMENT_TYPES.INPUT) {
    return { nodeType: ELEMENT_TYPES.INPUT, styleHints: styleHints, depth: depth };
  }

  var rawChildren = props.children;
  var children = [];
  if (rawChildren) {
    var arr = Array.isArray(rawChildren) ? rawChildren : [rawChildren];
    arr.forEach(function(child) {
      var result = analyzeElement(child, depth + 1);
      if (Array.isArray(result)) { result.forEach(function(r) { if (r) children.push(r); }); }
      else if (result) children.push(result);
    });
  }

  return { nodeType: ELEMENT_TYPES.CONTAINER, tag: typeof type === 'string' ? type : 'div', styleHints: styleHints, children: children, depth: depth };
}

module.exports = { analyzeElement: analyzeElement, ELEMENT_TYPES: ELEMENT_TYPES };
