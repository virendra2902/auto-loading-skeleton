/**
 * AutoSkeleton.jsx
 * Main wrapper component.
 *
 * Usage:
 *   <AutoSkeleton loading={isLoading}>
 *     <ProductCard />
 *   </AutoSkeleton>
 */

import React, { useEffect, useMemo } from 'react';
import { analyzeTree } from './analyzer.js';
import { renderSkeletonNodes } from './renderer.js';
import { injectStyles } from './styles.js';

/**
 * @typedef {Object} AutoSkeletonProps
 * @property {boolean}           loading       - Show skeleton when true
 * @property {React.ReactNode}   children      - The real UI component(s)
 * @property {'shimmer'|'pulse'|'wave'|'none'} [animation='shimmer']
 * @property {number}            [repeat=1]    - Repeat skeleton N times (e.g. list items)
 * @property {object}            [theme]       - { baseColor, highlightColor }
 * @property {React.CSSProperties} [style]     - Wrapper style
 * @property {string}            [className]   - Wrapper className
 * @property {string}            [ariaLabel]   - aria-label for the skeleton wrapper
 */

export function AutoSkeleton({
  loading = false,
  children,
  animation = 'shimmer',
  repeat = 1,
  theme = {},
  style,
  className,
  ariaLabel = 'Loading…',
}) {
  // Inject global CSS once
  useEffect(() => { injectStyles(); }, []);

  // Analyse the child tree once (memoised — re-runs only when children change)
  const skeletonNodes = useMemo(() => {
    if (!loading) return null;
    const childArray = React.Children.toArray(children);
    return childArray.flatMap(child => analyzeTree(child));
  }, [loading, children]);

  if (!loading) return children;

  const options = { animation, theme };
  const units = Array.from({ length: repeat }, (_, i) =>
    React.createElement(
      'div',
      { key: i, style: i > 0 ? { marginTop: 16 } : undefined },
      renderSkeletonNodes(skeletonNodes, options)
    )
  );

  return React.createElement(
    'div',
    {
      role: 'status',
      'aria-busy': true,
      'aria-label': ariaLabel,
      style,
      className,
    },
    ...units
  );
}

export default AutoSkeleton;
