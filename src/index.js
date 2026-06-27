'use strict';
/**
 * auto-loading-skeleton v4
 * The most intelligent React skeleton library.
 */
const AutoSkeleton   = require('./AutoSkeleton');
const primitives     = require('./primitives');
const hooks          = require('./hooks');
const context        = require('./context');
const analyzer       = require('./analyzer');
const renderer       = require('./renderer');
const styles         = require('./styles');
const cache          = require('./cache');
const plugins        = require('./plugins');
const observer       = require('./observer');
const errorBoundary  = require('./errorBoundary');
const { SkeletonDiffCache } = require('./differ');
const slots          = require('./slots');
const devtools       = require('./devtools');

module.exports = {
  // ── Core ──
  AutoSkeleton,

  // ── Provider ──
  SkeletonProvider:  context.SkeletonProvider,
  SkeletonContext:   context.SkeletonContext,

  // ── Slot System (V4) ──
  SkeletonSlot:             slots.SkeletonSlot,
  collectSlots:             slots.collectSlots,
  slotsToDescriptors:       slots.slotsToDescriptors,

  // ── Error Boundary ──
  SkeletonErrorBoundary:    errorBoundary.SkeletonErrorBoundary,
  withSkeletonErrorBoundary:errorBoundary.withSkeletonErrorBoundary,

  // ── DevTools (V4) ──
  SkeletonDevTools:         devtools.SkeletonDevTools,

  // ── V3 Primitives ──
  SkeletonBlock:     primitives.SkeletonBlock,
  SkeletonText:      primitives.SkeletonText,
  SkeletonAvatar:    primitives.SkeletonAvatar,
  SkeletonImage:     primitives.SkeletonImage,
  SkeletonBadge:     primitives.SkeletonBadge,
  SkeletonButton:    primitives.SkeletonButton,
  SkeletonInput:     primitives.SkeletonInput,
  SkeletonList:      primitives.SkeletonList,
  SkeletonForm:      primitives.SkeletonForm,
  SkeletonCard:      primitives.SkeletonCard,
  SkeletonTable:     primitives.SkeletonTable,
  SkeletonNav:       primitives.SkeletonNav,
  SkeletonCode:      primitives.SkeletonCode,
  SkeletonStat:      primitives.SkeletonStat,
  SkeletonRating:    primitives.SkeletonRating,
  SkeletonProgress:  primitives.SkeletonProgress,
  SkeletonTimeline:  primitives.SkeletonTimeline,
  SkeletonProfile:   primitives.SkeletonProfile,
  SkeletonDashboard: primitives.SkeletonDashboard,
  SkeletonSearch:    primitives.SkeletonSearch,

  // ── V4 New Primitives ──
  SkeletonSwitch:      primitives.SkeletonSwitch,
  SkeletonSlider:      primitives.SkeletonSlider,
  SkeletonCalendar:    primitives.SkeletonCalendar,
  SkeletonStepper:     primitives.SkeletonStepper,
  SkeletonBreadcrumb:  primitives.SkeletonBreadcrumb,
  SkeletonPagination:  primitives.SkeletonPagination,
  SkeletonMap:         primitives.SkeletonMap,
  SkeletonChipInput:   primitives.SkeletonChipInput,
  SkeletonKanban:      primitives.SkeletonKanban,
  SkeletonChatBubble:  primitives.SkeletonChatBubble,

  // ── V3 Hooks ──
  useSkeleton:             hooks.useSkeleton,
  useSkeletonDelay:        hooks.useSkeletonDelay,
  useSkeletonTimeout:      hooks.useSkeletonTimeout,
  useSkeletonData:         hooks.useSkeletonData,
  useSkeletonGroup:        hooks.useSkeletonGroup,
  useSkeletonRetry:        hooks.useSkeletonRetry,
  useSkeletonIntersection: hooks.useSkeletonIntersection,
  withSkeleton:            hooks.withSkeleton,

  // ── V4 New Hooks ──
  useSkeletonStream:       hooks.useSkeletonStream,
  useSkeletonPagination:   hooks.useSkeletonPagination,
  useSkeletonForm:         hooks.useSkeletonForm,
  useSkeletonPreload:      hooks.useSkeletonPreload,

  // ── Observer ──
  useObservedSkeleton:  observer.useObservedSkeleton,
  observeSkeleton:      observer.observe,
  disconnectObserver:   observer.disconnect,

  // ── Plugin System ──
  registerPlugin:   plugins.registerPlugin,
  unregisterPlugin: plugins.unregisterPlugin,
  listPlugins:      plugins.listPlugins,

  // ── Diffing (V4) ──
  SkeletonDiffCache,

  // ── Low-level ──
  analyzeElement: analyzer.analyzeElement,
  renderNode:     renderer.renderNode,
  injectStyles:   styles.injectStyles,
  cacheStats:     cache.stats,
  clearCache:     cache.clear,
  invalidateCache:cache.invalidate,

  // ── Constants ──
  NODE:   analyzer.NODE,
  THEMES: styles.THEMES,
};
