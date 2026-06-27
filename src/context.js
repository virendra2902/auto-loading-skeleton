'use strict';
/* context.js — V4 */
const React = require('react');
const DEFAULT = {
  animation:'shimmer', theme:'default', themeOverrides:{},
  fadeIn:true, transition:'fade', stagger:false,
  errorBoundary:true, maxDepth:12, detectRepeats:true,
  repeatThreshold:0.6, devMode:false, diffing:true,
};
const SkeletonContext = React.createContext(DEFAULT);
function SkeletonProvider(props) {
  const v = { ...DEFAULT };
  ['animation','theme','themeOverrides','fadeIn','transition','stagger',
   'errorBoundary','maxDepth','detectRepeats','repeatThreshold','devMode','diffing']
    .forEach(k => { if (props[k] != null) v[k] = props[k]; });
  return React.createElement(SkeletonContext.Provider, { value: v }, props.children);
}
SkeletonProvider.displayName = 'SkeletonProvider';
module.exports = { SkeletonContext, SkeletonProvider, DEFAULT };
