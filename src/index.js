'use strict';

/**
 * auto-loading-skeleton v2
 * Main entry point.
 */

var AutoSkeleton   = require('./AutoSkeleton');
var primitives     = require('./primitives');
var hooks          = require('./hooks');
var context        = require('./context');
var analyzer       = require('./analyzer');
var renderer       = require('./renderer');
var styles         = require('./styles');
var cache          = require('./cache');

module.exports = {
  // Main component
  AutoSkeleton,

  // Provider
  SkeletonProvider:  context.SkeletonProvider,
  SkeletonContext:   context.SkeletonContext,

  // Primitives
  SkeletonBlock:   primitives.SkeletonBlock,
  SkeletonText:    primitives.SkeletonText,
  SkeletonAvatar:  primitives.SkeletonAvatar,
  SkeletonImage:   primitives.SkeletonImage,
  SkeletonBadge:   primitives.SkeletonBadge,
  SkeletonButton:  primitives.SkeletonButton,
  SkeletonInput:   primitives.SkeletonInput,
  SkeletonList:    primitives.SkeletonList,
  SkeletonForm:    primitives.SkeletonForm,
  SkeletonCard:    primitives.SkeletonCard,

  // Hooks
  useSkeleton:        hooks.useSkeleton,
  useSkeletonDelay:   hooks.useSkeletonDelay,
  useSkeletonTimeout: hooks.useSkeletonTimeout,
  useSkeletonData:    hooks.useSkeletonData,
  withSkeleton:       hooks.withSkeleton,

  // Low-level (for advanced use)
  analyzeElement: analyzer.analyzeElement,
  renderNode:     renderer.renderNode,
  injectStyles:   styles.injectStyles,
  clearCache:     cache.clear,

  // Theme presets reference
  THEMES: styles.THEMES,
};
