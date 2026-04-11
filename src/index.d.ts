import { ReactNode, CSSProperties, FC } from 'react';

export type SkeletonAnimation = 'shimmer' | 'pulse' | 'wave' | 'none';

export interface SkeletonTheme {
  /** Base skeleton color. Default: #e2e8f0 */
  baseColor?: string;
  /** Highlight color for shimmer/wave. Default: #f8fafc */
  highlightColor?: string;
}

export interface AutoSkeletonProps {
  /** Show skeleton when true, render real children when false */
  loading: boolean;
  children: ReactNode;
  /** Animation style. Default: 'shimmer' */
  animation?: SkeletonAnimation;
  /** Repeat the skeleton pattern N times. Useful for lists. Default: 1 */
  repeat?: number;
  /** Theme overrides */
  theme?: SkeletonTheme;
  style?: CSSProperties;
  className?: string;
  /** Accessible label for the loading region. Default: 'Loading…' */
  ariaLabel?: string;
}

export type SkeletonItemType = 'text' | 'image' | 'avatar' | 'button' | 'input';

export interface SkeletonItemProps {
  type?: SkeletonItemType;
  lines?: number;
  width?: number | string;
  height?: number | string;
  /** For avatar type: shorthand for equal width and height */
  size?: number;
  animation?: SkeletonAnimation;
  theme?: SkeletonTheme;
  style?: CSSProperties;
}

/** Main wrapper component — auto-generates a skeleton from its children */
export const AutoSkeleton: FC<AutoSkeletonProps>;

/** Primitive building block for manually-crafted skeletons */
export const SkeletonItem: FC<SkeletonItemProps>;

/** Inject global CSS (called automatically; export for SSR use) */
export function injectStyles(): void;

export default AutoSkeleton;
