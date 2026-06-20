'use strict';

/**
 * context.js — V2
 *
 * SkeletonProvider lets you set default animation, theme, and options
 * globally so every <AutoSkeleton> in the tree inherits them without
 * passing props repeatedly.
 */

var React = require('react');

var DEFAULT_CTX = {
  animation:      'shimmer',
  theme:          'default',
  themeOverrides: {},
  fadeIn:         true,
  maxDepth:       8,
  detectRepeats:  true,
};

var SkeletonContext = React.createContext(DEFAULT_CTX);

function SkeletonProvider(props) {
  var value = Object.assign({}, DEFAULT_CTX, {
    animation:      props.animation      || DEFAULT_CTX.animation,
    theme:          props.theme          || DEFAULT_CTX.theme,
    themeOverrides: props.themeOverrides || DEFAULT_CTX.themeOverrides,
    fadeIn:         props.fadeIn         != null ? props.fadeIn : DEFAULT_CTX.fadeIn,
    maxDepth:       props.maxDepth       != null ? props.maxDepth : DEFAULT_CTX.maxDepth,
    detectRepeats:  props.detectRepeats  != null ? props.detectRepeats : DEFAULT_CTX.detectRepeats,
  });
  return React.createElement(SkeletonContext.Provider, { value: value }, props.children);
}

SkeletonProvider.displayName = 'SkeletonProvider';

module.exports = { SkeletonContext, SkeletonProvider, DEFAULT_CTX };
