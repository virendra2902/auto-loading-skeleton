'use strict';

/**
 * styles.js — V2
 *
 * Improvements over V1:
 *  - Full dark-mode awareness via prefers-color-scheme
 *  - prefers-reduced-motion: replaces shimmer/wave with fade-only
 *  - Named theme presets (default, dark, minimal, brand, soft)
 *  - Per-instance CSS variable injection via data-ask-id attribute
 *  - All skeleton CSS vars scoped under [data-ask] to avoid global leakage
 *  - SSR-safe (guards typeof document)
 */

var STYLE_ID = 'ask-v2-styles';

var BASE_CSS = `
/* ── auto-skeleton-v2 base ── */
[data-ask] {
  --ask-base:       #e2e8f0;
  --ask-highlight:  rgba(255,255,255,0.65);
  --ask-dur:        1.4s;
  --ask-radius:     4px;
  --ask-radius-lg:  8px;
  --ask-radius-xl:  9999px;
}
@media (prefers-color-scheme: dark) {
  [data-ask] {
    --ask-base:      #2d3748;
    --ask-highlight: rgba(255,255,255,0.06);
  }
}

/* block primitive */
.ask-b {
  display: block;
  position: relative;
  overflow: hidden;
  background: var(--ask-base);
  border-radius: var(--ask-radius);
  flex-shrink: 0;
}
.ask-b.ask-circle  { border-radius: 50%; }
.ask-b.ask-pill    { border-radius: var(--ask-radius-xl); }
.ask-b.ask-rounded { border-radius: var(--ask-radius-lg); }

/* animations */
.ask-shimmer.ask-b::after {
  content: '';
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--ask-highlight) 50%,
    transparent 100%
  );
  animation: ask-shimmer-kf var(--ask-dur) infinite;
}
@keyframes ask-shimmer-kf { to { transform: translateX(100%); } }

.ask-pulse.ask-b {
  animation: ask-pulse-kf var(--ask-dur) ease-in-out infinite;
}
@keyframes ask-pulse-kf { 0%,100%{opacity:1} 50%{opacity:.35} }

.ask-wave.ask-b::after {
  content: '';
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--ask-highlight) 50%,
    transparent 100%
  );
  animation: ask-wave-kf calc(var(--ask-dur) * 1.15) ease-in-out infinite;
}
@keyframes ask-wave-kf { 0%{transform:translateX(-100%)} 100%{transform:translateX(150%)} }

.ask-glow.ask-b {
  animation: ask-glow-kf var(--ask-dur) ease-in-out infinite;
}
@keyframes ask-glow-kf {
  0%,100%{ box-shadow: 0 0 0px 0px transparent; }
  50%    { box-shadow: 0 0 12px 2px var(--ask-highlight); }
}

.ask-none.ask-b { opacity: .55; }

/* reduced motion: replace all animation with simple fade */
@media (prefers-reduced-motion: reduce) {
  .ask-shimmer.ask-b::after,
  .ask-wave.ask-b::after { animation: none; background: none; }
  .ask-shimmer.ask-b,
  .ask-wave.ask-b,
  .ask-pulse.ask-b,
  .ask-glow.ask-b {
    animation: ask-pulse-kf calc(var(--ask-dur)*2) ease-in-out infinite;
  }
}

/* wrapper utilities */
.ask-wrap { pointer-events: none; user-select: none; }
.ask-row  { display: flex; flex-direction: row;    }
.ask-col  { display: flex; flex-direction: column; }

/* transition helper applied to real children */
.ask-fade-in { animation: ask-fadein 0.25s ease both; }
@keyframes ask-fadein { from{opacity:0; transform:translateY(4px)} to{opacity:1; transform:none} }
`;

var injected = false;

function injectStyles() {
  if (injected) return;
  if (typeof document === 'undefined') { injected = true; return; }
  if (document.getElementById(STYLE_ID)) { injected = true; return; }
  var s = document.createElement('style');
  s.id          = STYLE_ID;
  s.textContent = BASE_CSS;
  document.head.appendChild(s);
  injected = true;
}

/* ── theme presets ── */
var THEMES = {
  default: {},
  dark: {
    '--ask-base':      '#1a202c',
    '--ask-highlight': 'rgba(255,255,255,0.04)',
  },
  minimal: {
    '--ask-base':      '#f1f5f9',
    '--ask-highlight': 'rgba(255,255,255,0.9)',
    '--ask-dur':       '1.8s',
  },
  soft: {
    '--ask-base':      '#ede9fe',
    '--ask-highlight': 'rgba(255,255,255,0.7)',
    '--ask-radius':    '8px',
  },
  brand: {
    '--ask-base':      '#dbeafe',
    '--ask-highlight': 'rgba(255,255,255,0.75)',
    '--ask-radius':    '6px',
    '--ask-dur':       '1.2s',
  },
  warm: {
    '--ask-base':      '#fef3c7',
    '--ask-highlight': 'rgba(255,255,255,0.7)',
    '--ask-radius':    '6px',
  },
};

/**
 * Build an inline style object merging a named preset + user overrides.
 * Returns a plain object suitable for React style={} prop.
 */
function buildThemeStyle(preset, overrides) {
  preset    = preset    || 'default';
  overrides = overrides || {};
  var base  = THEMES[preset] || {};
  var merged = Object.assign({}, base);

  // Map user-facing keys → CSS vars
  var keyMap = {
    baseColor:    '--ask-base',
    highlightColor: '--ask-highlight',
    shimmerColor: '--ask-highlight',  // alias
    duration:     '--ask-dur',
    borderRadius: '--ask-radius',
  };
  Object.keys(overrides).forEach(function(k) {
    var cssVar = keyMap[k] || k;
    merged[cssVar] = overrides[k];
  });

  return merged;
}

function blockClass(animation, shape) {
  var parts = ['ask-b', 'ask-' + (animation || 'shimmer')];
  if (shape) parts.push('ask-' + shape);
  return parts.join(' ');
}

module.exports = { injectStyles, blockClass, buildThemeStyle, THEMES, BASE_CSS };
