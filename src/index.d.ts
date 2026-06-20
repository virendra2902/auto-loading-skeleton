import { ReactNode, CSSProperties, FC, Context, ComponentType } from 'react';

/* ── Animations ── */
export type SkeletonAnimation = 'shimmer' | 'pulse' | 'wave' | 'glow' | 'none';

/* ── Theme presets ── */
export type SkeletonThemePreset = 'default' | 'dark' | 'minimal' | 'soft' | 'brand' | 'warm';

export interface SkeletonThemeOverrides {
  baseColor?:       string;
  highlightColor?:  string;
  shimmerColor?:    string; // alias for highlightColor
  duration?:        string;
  borderRadius?:    string;
  [cssVar: string]: string | undefined;
}

/* ── Context ── */
export interface SkeletonContextValue {
  animation:      SkeletonAnimation;
  theme:          SkeletonThemePreset;
  themeOverrides: SkeletonThemeOverrides;
  fadeIn:         boolean;
  maxDepth:       number;
  detectRepeats:  boolean;
}

export declare const SkeletonContext: Context<SkeletonContextValue>;

export interface SkeletonProviderProps {
  animation?:      SkeletonAnimation;
  theme?:          SkeletonThemePreset;
  themeOverrides?: SkeletonThemeOverrides;
  fadeIn?:         boolean;
  maxDepth?:       number;
  detectRepeats?:  boolean;
  children:        ReactNode;
}
export declare const SkeletonProvider: FC<SkeletonProviderProps>;

/* ── AutoSkeleton ── */
export interface AutoSkeletonProps {
  /** Show skeleton when true */
  loading: boolean;
  children: ReactNode;
  animation?:      SkeletonAnimation;
  theme?:          SkeletonThemePreset;
  themeOverrides?: SkeletonThemeOverrides;
  /** Number of skeleton copies (for lists) */
  count?:          number;
  /** Gap between count copies */
  gap?:            string;
  /** Animate real content appearing with fade-in */
  fadeIn?:         boolean;
  /** Custom ARIA label */
  ariaLabel?:      string;
  /** Fired once when loading transitions to false */
  onLoaded?:       () => void;
  /** Render prop: full manual skeleton override */
  renderSkeleton?: (opts: { animation: SkeletonAnimation }) => ReactNode;
  /** Max recursion depth for analyzer */
  maxDepth?:       number;
  detectRepeats?:  boolean;
  className?:      string;
  style?:          CSSProperties;
}
export declare const AutoSkeleton: FC<AutoSkeletonProps>;

/* ── Primitives ── */
export interface SkeletonBlockProps {
  width?:     string | number;
  height?:    string | number;
  shape?:     'circle' | 'pill' | 'rounded';
  animation?: SkeletonAnimation;
  className?: string;
  style?:     CSSProperties;
}
export declare const SkeletonBlock: FC<SkeletonBlockProps>;

export interface SkeletonTextProps {
  lines?:         number;
  lineHeight?:    string;
  gap?:           string;
  lastLineWidth?: string;
  animation?:     SkeletonAnimation;
  style?:         CSSProperties;
}
export declare const SkeletonText: FC<SkeletonTextProps>;

export interface SkeletonAvatarProps {
  size?:      string | number;
  animation?: SkeletonAnimation;
  style?:     CSSProperties;
}
export declare const SkeletonAvatar: FC<SkeletonAvatarProps>;

export interface SkeletonImageProps {
  height?:    string | number;
  animation?: SkeletonAnimation;
  style?:     CSSProperties;
}
export declare const SkeletonImage: FC<SkeletonImageProps>;

export declare const SkeletonBadge:  FC<{ width?: string; animation?: SkeletonAnimation; style?: CSSProperties }>;
export declare const SkeletonButton: FC<{ width?: string; height?: string; animation?: SkeletonAnimation; style?: CSSProperties }>;
export declare const SkeletonInput:  FC<{ height?: string; animation?: SkeletonAnimation; style?: CSSProperties }>;

export interface SkeletonListProps {
  count?:       number;
  gap?:         string;
  rowHeight?:   string;
  animation?:   SkeletonAnimation;
  renderItem?:  (opts: { animation: SkeletonAnimation; index: number }) => ReactNode;
}
export declare const SkeletonList: FC<SkeletonListProps>;

export interface SkeletonFormProps {
  fields?:    number;
  animation?: SkeletonAnimation;
  style?:     CSSProperties;
}
export declare const SkeletonForm: FC<SkeletonFormProps>;

export interface SkeletonCardProps {
  image?:       boolean;
  avatar?:      boolean;
  footer?:      boolean;
  lines?:       number;
  imageHeight?: string;
  animation?:   SkeletonAnimation;
  style?:       CSSProperties;
}
export declare const SkeletonCard: FC<SkeletonCardProps>;

/* ── Hooks ── */
export interface UseSkeletonReturn {
  loading:       boolean;
  setLoading:    (v: boolean) => void;
  skeletonProps: { loading: boolean } & Partial<AutoSkeletonProps>;
}
export declare function useSkeleton(initialLoading?: boolean, options?: Partial<AutoSkeletonProps>): UseSkeletonReturn;

/** Prevents flash of skeleton for fast responses (< delay ms). */
export declare function useSkeletonDelay(loading: boolean, delay?: number): boolean;

/** Keeps skeleton visible for at least minDuration ms. */
export declare function useSkeletonTimeout(loading: boolean, minDuration?: number): boolean;

export interface UseSkeletonDataReturn<T> {
  data:    T | null;
  loading: boolean;
  error:   Error | null;
}
export declare function useSkeletonData<T>(fetchFn: () => Promise<T>, deps?: unknown[]): UseSkeletonDataReturn<T>;

export declare function withSkeleton<P extends object>(
  Component: ComponentType<P>,
  defaultOptions?: Partial<AutoSkeletonProps>
): FC<P & { loading?: boolean; skeletonAnimation?: SkeletonAnimation; skeletonTheme?: SkeletonThemePreset; skeletonCount?: number }>;

/* ── Low-level / Advanced ── */
export declare function analyzeElement(element: ReactNode, depth?: number, opts?: object): object | null;
export declare function renderNode(descriptor: object | null, options?: object): ReactNode;
export declare function injectStyles(): void;
export declare function clearCache(): void;

export declare const THEMES: Record<SkeletonThemePreset, Record<string, string>>;
