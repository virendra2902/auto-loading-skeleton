'use strict';

/**
 * AutoSkeleton.js — V2
 *
 * Improvements over V1:
 *  - Reads defaults from SkeletonContext (SkeletonProvider)
 *  - Memoized descriptor via cache.js
 *  - fadeIn prop smoothly transitions real content in after loading
 *  - theme preset + themeOverrides merged into CSS vars
 *  - aria-live="polite" so screen readers announce content arrival
 *  - count renders siblings separated by gap (configurable)
 *  - renderSkeleton render prop for full manual override
 *  - onLoaded callback fired when loading transitions false
 *  - SSR safe (injectStyles is no-op on server)
 */

var React           = require('react');
var analyzeElement  = require('./analyzer').analyzeElement;
var renderNode      = require('./renderer').renderNode;
var resetKeys       = require('./renderer').resetKeys;
var injectStyles    = require('./styles').injectStyles;
var buildThemeStyle = require('./styles').buildThemeStyle;
var cache           = require('./cache');
var ctx             = require('./context');

function AutoSkeleton(props) {
  var loading         = props.loading;
  var children        = props.children;
  var className       = props.className       || '';
  var style           = props.style           || {};
  var count           = props.count           || 1;
  var gap             = props.gap             || '16px';
  var ariaLabel       = props.ariaLabel       || 'Loading…';
  var onLoaded        = props.onLoaded;
  var renderSkeleton  = props.renderSkeleton;  // render prop override

  // Read context
  var context         = React.useContext(ctx.SkeletonContext);
  var animation       = props.animation       || context.animation;
  var theme           = props.theme           || context.theme;
  var themeOverrides  = props.themeOverrides  || context.themeOverrides;
  var fadeIn          = props.fadeIn          != null ? props.fadeIn : context.fadeIn;
  var maxDepth        = props.maxDepth        != null ? props.maxDepth : context.maxDepth;
  var detectRepeats   = props.detectRepeats   != null ? props.detectRepeats : context.detectRepeats;

  // Inject base CSS once
  React.useEffect(function() { injectStyles(); }, []);
  if (typeof document !== 'undefined') injectStyles();

  // Fire onLoaded when loading transitions to false
  var prevLoading = React.useRef(loading);
  React.useEffect(function() {
    if (prevLoading.current === true && loading === false && typeof onLoaded === 'function') {
      onLoaded();
    }
    prevLoading.current = loading;
  }, [loading]);

  // Build theme CSS vars
  var themeStyle = buildThemeStyle(theme, themeOverrides);
  var wrapStyle  = Object.assign({}, style, themeStyle);

  if (!loading) {
    // Render real children with optional fade-in animation
    return React.createElement('div', {
      'data-ask':   '',
      className:    'ask-wrap' + (className ? ' ' + className : '') + (fadeIn ? ' ask-fade-in' : ''),
      style:        wrapStyle,
      'aria-live':  'polite',
      'aria-busy':  'false',
    }, children);
  }

  // Use render prop if provided
  if (typeof renderSkeleton === 'function') {
    return React.createElement('div', {
      'data-ask':   '',
      className:    'ask-wrap' + (className ? ' ' + className : ''),
      style:        wrapStyle,
      'aria-busy':  'true',
      'aria-label': ariaLabel,
    }, renderSkeleton({ animation: animation }));
  }

  // Analyze + render skeleton
  var descriptor = cache.get(children);
  if (!descriptor) {
    descriptor = analyzeElement(children, 0, { maxDepth: maxDepth, detectRepeats: detectRepeats });
    cache.set(children, descriptor);
  }

  resetKeys();
  var skeletonEl = renderNode(descriptor, { animation: animation });

  // Render count copies
  var items = [];
  for (var i = 0; i < Math.max(1, count); i++) {
    items.push(React.createElement('div', {
      key:   'ask-item-' + i,
      style: i < count - 1 ? { marginBottom: gap } : {},
    }, skeletonEl));
  }

  return React.createElement('div', {
    'data-ask':   '',
    className:    'ask-wrap' + (className ? ' ' + className : ''),
    style:        wrapStyle,
    'aria-busy':  'true',
    'aria-label': ariaLabel,
    role:         'status',
  }, items);
}

AutoSkeleton.displayName = 'AutoSkeleton';

module.exports = AutoSkeleton;
