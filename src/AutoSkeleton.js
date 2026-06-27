'use strict';
/**
 * AutoSkeleton.js — V4
 *
 * NEW over V3:
 *  - Slot system: reads SkeletonSlot children for zero-ambiguity skeletons
 *  - Skeleton diffing: skips re-render for unchanged descriptor trees
 *  - DevTools integration: registers/unregisters in devtools store
 *  - useSkeletonPreload: pre-warms cache during idle time
 *  - Suspense mode: detects React.Suspense boundaries in children
 *  - RTL support: mirrors layout when dir="rtl" detected
 *  - 'morph' transition: spring-based content reveal
 *  - instanceId is now deterministic if an id prop is passed
 */

const React              = require('react');
const { analyzeElement } = require('./analyzer');
const { renderNode, resetKeys } = require('./renderer');
const { injectStyles, injectInstanceTheme, buildThemeStyle } = require('./styles');
const cache              = require('./cache');
const ctx                = require('./context');
const { SkeletonErrorBoundary } = require('./errorBoundary');
const plugins            = require('./plugins');
const { SkeletonDiffCache } = require('./differ');
const { collectSlots, slotsToDescriptors, isSlotElement } = require('./slots');
const devtools           = require('./devtools');

const _diffCaches = new WeakMap(); // per-component instance diff cache
let _ic = 0;

function AutoSkeleton(props) {
  const {
    loading, children,
    className='', style={},
    count=1, gap='16px',
    ariaLabel='Loading…',
    onLoaded, renderSkeleton,
    id,   // optional stable instance ID
  } = props;

  const context = React.useContext(ctx.SkeletonContext);
  const animation      = props.animation      ?? context.animation;
  const theme          = props.theme          ?? context.theme;
  const themeOverrides = props.themeOverrides ?? context.themeOverrides;
  const fadeIn         = props.fadeIn         ?? context.fadeIn;
  const transition     = props.transition     ?? context.transition;
  const stagger        = props.stagger        ?? context.stagger;
  const useEB          = props.errorBoundary  ?? context.errorBoundary;
  const maxDepth       = props.maxDepth       ?? context.maxDepth;
  const detectRepeats  = props.detectRepeats  ?? context.detectRepeats;
  const repeatThreshold= props.repeatThreshold?? context.repeatThreshold;
  const devMode        = props.devMode        ?? context.devMode;
  const diffing        = props.diffing        ?? context.diffing;

  // Stable instance ID
  const instanceId = React.useRef(id || ('ask4-' + (++_ic))).current;

  // Per-instance diff cache (tied to component lifecycle via ref)
  const diffCacheRef = React.useRef(null);
  if (!diffCacheRef.current) diffCacheRef.current = new SkeletonDiffCache();

  // Style injection
  React.useEffect(() => { injectStyles(); }, []);
  if (typeof document !== 'undefined') injectStyles();

  // Scoped theme
  const themeVars = buildThemeStyle(theme, themeOverrides);
  React.useEffect(() => {
    if (Object.keys(themeVars).length > 0) injectInstanceTheme(instanceId, themeVars);
  }, [theme, JSON.stringify(themeOverrides)]);

  // onLoaded callback
  const prevLoading = React.useRef(loading);
  React.useEffect(() => {
    if (prevLoading.current && !loading && typeof onLoaded === 'function') onLoaded();
    prevLoading.current = loading;
  }, [loading]);

  // DevTools registration
  React.useEffect(() => {
    if (devMode) {
      devtools.registerInstance(instanceId, { loading, animation, theme });
      return () => devtools.unregisterInstance(instanceId);
    }
  }, [loading, animation, theme, devMode]);

  // DevTools cache stats sync
  React.useEffect(() => {
    if (devMode) devtools.updateCacheStats(cache.stats());
  });

  // Transition class for content reveal
  const tcls = (!loading && fadeIn)
    ? { fade:'ask4-fade', slideup:'ask4-slideup', scale:'ask4-scale', morph:'ask4-morph', none:'' }[transition] || 'ask4-fade'
    : '';

  if (!loading) {
    return React.createElement('div', {
      'data-ask4': instanceId, className: `ask4-wrap${tcls?' '+tcls:''}${className?' '+className:''}`,
      style, 'aria-live':'polite', 'aria-busy':'false',
    }, children);
  }

  // Render prop override
  if (typeof renderSkeleton === 'function') {
    return React.createElement('div', {
      'data-ask4':instanceId, className:`ask4-wrap${className?' '+className:''}`,
      style, role:'status', 'aria-busy':'true', 'aria-label':ariaLabel,
    }, renderSkeleton({ animation, stagger, instanceId }));
  }

  // Check for SkeletonSlot children
  const slots = collectSlots(children);
  let descriptor;
  if (slots.length > 0) {
    // Slot mode: use explicit slot definitions
    const slotDescs = slotsToDescriptors(slots);
    descriptor = { nodeType:'container', tag:'div', children: slotDescs, styleHints:{}, _conf:1.0 };
  } else {
    // Analyzer mode
    descriptor = cache.get(children);
    if (!descriptor) {
      plugins.runBeforeAnalyze && plugins.runBeforeAnalyze(children, { maxDepth, detectRepeats, repeatThreshold });
      const pluginResult = plugins.runAnalyzerPlugins && plugins.runAnalyzerPlugins(children, 0, { maxDepth, detectRepeats, repeatThreshold });
      descriptor = pluginResult || analyzeElement(children, 0, { maxDepth, detectRepeats, repeatThreshold });
      cache.set(children, descriptor);
    }
  }

  if (devMode && descriptor && descriptor._conf != null && descriptor._conf < 0.45) {
    console.warn(`[ask4] low confidence (${descriptor._conf.toFixed(2)}) for:`, children);
  }

  resetKeys();
  const opts = { animation, stagger };

  // Diffing: check if descriptor changed since last render
  let skeletonEl;
  if (diffing) {
    const cached = diffCacheRef.current.get(instanceId, descriptor);
    if (cached) {
      skeletonEl = cached;
    } else {
      const pluginEl = plugins.runRendererPlugins && plugins.runRendererPlugins(descriptor, opts);
      skeletonEl = pluginEl || renderNode(descriptor, opts);
      diffCacheRef.current.set(instanceId, descriptor, skeletonEl);
    }
  } else {
    const pluginEl = plugins.runRendererPlugins && plugins.runRendererPlugins(descriptor, opts);
    skeletonEl = pluginEl || renderNode(descriptor, opts);
  }

  plugins.runAfterRender && plugins.runAfterRender(skeletonEl, descriptor, opts);

  const items = [];
  for (let i=0; i<Math.max(1,count); i++) {
    items.push(React.createElement('div', { key:'ask4-i'+i, style:i<count-1?{marginBottom:gap}:{} }, skeletonEl));
  }

  const content = React.createElement('div', {
    'data-ask4':instanceId, className:`ask4-wrap${className?' '+className:''}`,
    style, role:'status', 'aria-busy':'true', 'aria-label':ariaLabel,
  }, items);

  return useEB
    ? React.createElement(SkeletonErrorBoundary, {
        onError: devMode ? err => console.error('[ask4] boundary:', err) : undefined
      }, content)
    : content;
}

AutoSkeleton.displayName = 'AutoSkeleton';
module.exports = AutoSkeleton;
