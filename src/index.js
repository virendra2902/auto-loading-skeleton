const React = require('react');
const { analyzeElement } = require('./analyzer');
const { renderNode } = require('./renderer');
const { injectStyles, blockClass, buildThemeVars } = require('./styles');

function AutoSkeleton(props) {
  var loading = props.loading;
  var animation = props.animation || 'shimmer';
  var theme = props.theme || {};
  var count = props.count || 1;
  var children = props.children;
  var className = props.className || '';
  var style = props.style || {};

  React.useEffect(function() { injectStyles(); }, []);
  if (typeof document !== 'undefined') injectStyles();

  if (!loading) return children;

  var cssVarStyle = {};
  var varMap = { baseColor: '--ask-base-color', shimmerColor: '--ask-shimmer-color', duration: '--ask-duration', borderRadius: '--ask-border-radius' };
  Object.entries(theme).forEach(function(pair) { if (varMap[pair[0]]) cssVarStyle[varMap[pair[0]]] = pair[1]; });

  var descriptor = analyzeElement(children);
  var skeletonEl = renderNode(descriptor, { animation: animation });

  var items = [];
  for (var i = 0; i < Math.max(1, count); i++) {
    items.push(React.createElement('div', { key: i, style: i < count - 1 ? { marginBottom: '16px' } : {} }, skeletonEl));
  }

  return React.createElement('div', {
    className: 'ask-wrapper' + (className ? ' ' + className : ''),
    style: Object.assign({}, style, cssVarStyle),
    'aria-busy': 'true',
    'aria-label': 'Loading\u2026',
  }, items);
}

function SkeletonBlock(props) {
  var width = props.width || '100%';
  var height = props.height || '16px';
  var shape = props.shape;
  var animation = props.animation || 'shimmer';
  var style = props.style || {};
  var className = props.className || '';
  React.useEffect(function() { injectStyles(); }, []);
  if (typeof document !== 'undefined') injectStyles();
  return React.createElement('span', {
    className: blockClass(animation, shape) + (className ? ' ' + className : ''),
    style: Object.assign({ width: width, height: height, display: 'block' }, style),
    'aria-hidden': 'true',
  });
}

function SkeletonText(props) {
  var lines = props.lines || 3;
  var animation = props.animation || 'shimmer';
  var lastLineWidth = props.lastLineWidth || '60%';
  var lineHeight = props.lineHeight || '1em';
  var gap = props.gap || '8px';
  var style = props.style || {};
  React.useEffect(function() { injectStyles(); }, []);
  if (typeof document !== 'undefined') injectStyles();
  var lineEls = [];
  for (var i = 0; i < lines; i++) {
    lineEls.push(React.createElement('span', { key: i, className: blockClass(animation), style: { display: 'block', width: i === lines - 1 ? lastLineWidth : '100%', height: lineHeight, marginBottom: i < lines - 1 ? gap : 0 }, 'aria-hidden': 'true' }));
  }
  return React.createElement('div', { style: style, 'aria-hidden': 'true' }, lineEls);
}

function SkeletonAvatar(props) {
  var size = props.size || '40px';
  return React.createElement(SkeletonBlock, { width: size, height: size, shape: 'circle', animation: props.animation || 'shimmer', style: props.style || {} });
}

function useSkeleton(initialLoading, options) {
  initialLoading = initialLoading !== undefined ? initialLoading : true;
  options = options || {};
  var state = React.useState(initialLoading);
  var loading = state[0];
  var setLoading = state[1];
  return { loading: loading, setLoading: setLoading, skeletonProps: Object.assign({ loading: loading }, options) };
}

function withSkeleton(WrappedComponent, defaultOptions) {
  defaultOptions = defaultOptions || {};
  var displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
  function WithSkeletonWrapper(props) {
    var loading = props.loading !== undefined ? props.loading : false;
    var skeletonAnimation = props.skeletonAnimation;
    var skeletonTheme = props.skeletonTheme;
    var skeletonCount = props.skeletonCount;
    var rest = Object.assign({}, props);
    delete rest.loading; delete rest.skeletonAnimation; delete rest.skeletonTheme; delete rest.skeletonCount;
    return React.createElement(AutoSkeleton, { loading: loading, animation: skeletonAnimation || defaultOptions.animation || 'shimmer', theme: skeletonTheme || defaultOptions.theme || {}, count: skeletonCount || defaultOptions.count || 1 }, React.createElement(WrappedComponent, rest));
  }
  WithSkeletonWrapper.displayName = 'WithSkeleton(' + displayName + ')';
  return WithSkeletonWrapper;
}

module.exports = { AutoSkeleton, SkeletonBlock, SkeletonText, SkeletonAvatar, useSkeleton, withSkeleton, analyzeElement, renderNode, injectStyles };
