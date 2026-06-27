'use strict';
/**
 * styles.js — V4
 *
 * NEW over V3:
 *  - CSS @layer for clean specificity management
 *  - color-scheme: light dark meta for auto OS theme
 *  - coarse pointer (touch device) media query → larger skeleton blocks on mobile
 *  - 12 theme presets (adds aurora, midnight, chalk, paper)
 *  - CSS custom property schema is now versioned (--ask4-*)
 *  - Skeleton diff hash: each render gets a hash so unchanged subtrees skip CSS injection
 *  - Morphing transition: skeleton fades + scales slightly on reveal
 *  - content-visibility: auto on wrapper for rendering performance
 */

const STYLE_ID = 'ask-v4-styles';

const BASE_CSS = `
@layer ask4 {
  [data-ask4] {
    --ask4-base:        #e2e8f0;
    --ask4-shine:       rgba(255,255,255,0.65);
    --ask4-dur:         1.4s;
    --ask4-radius:      4px;
    --ask4-radius-lg:   10px;
    --ask4-radius-pill: 9999px;
    --ask4-stagger:     60ms;
    color-scheme: light dark;
  }
  @media (prefers-color-scheme: dark) {
    [data-ask4] {
      --ask4-base:  #1e293b;
      --ask4-shine: rgba(255,255,255,0.055);
    }
  }
  .ask4-b {
    display: block; position: relative; overflow: hidden;
    background: var(--ask4-base); border-radius: var(--ask4-radius);
    flex-shrink: 0; contain: strict;
  }
  .ask4-b.ask4-circle  { border-radius: 50%; }
  .ask4-b.ask4-pill    { border-radius: var(--ask4-radius-pill); }
  .ask4-b.ask4-rounded { border-radius: var(--ask4-radius-lg); }

  /* shimmer */
  .ask4-shimmer.ask4-b::after {
    content: ''; position: absolute; inset: 0; transform: translateX(-100%);
    background: linear-gradient(90deg,transparent,var(--ask4-shine),transparent);
    animation: ask4-sh var(--ask4-dur) infinite;
  }
  @keyframes ask4-sh { to { transform: translateX(100%); } }

  /* pulse */
  .ask4-pulse.ask4-b { animation: ask4-pu var(--ask4-dur) ease-in-out infinite; }
  @keyframes ask4-pu { 0%,100%{opacity:1} 50%{opacity:.28} }

  /* wave */
  .ask4-wave.ask4-b::after {
    content: ''; position: absolute; inset: 0; transform: translateX(-100%);
    background: linear-gradient(90deg,transparent,var(--ask4-shine),transparent);
    animation: ask4-wv calc(var(--ask4-dur)*1.12) ease-in-out infinite;
  }
  @keyframes ask4-wv { 0%{transform:translateX(-100%)} 100%{transform:translateX(150%)} }

  /* glow */
  .ask4-glow.ask4-b { animation: ask4-gl var(--ask4-dur) ease-in-out infinite; }
  @keyframes ask4-gl { 0%,100%{filter:brightness(1)} 50%{filter:brightness(1.3)} }

  /* scan */
  .ask4-scan.ask4-b::after {
    content: ''; position: absolute; left:0; right:0; height:2px;
    background: var(--ask4-shine); top:0;
    animation: ask4-sc var(--ask4-dur) linear infinite;
  }
  @keyframes ask4-sc { to { top:100%; } }

  /* blink (V4 new) — subtle opacity blink, great for minimal UIs */
  .ask4-blink.ask4-b { animation: ask4-bl calc(var(--ask4-dur)*0.9) step-start infinite; }
  @keyframes ask4-bl { 0%,100%{opacity:1} 50%{opacity:.45} }

  /* flow (V4 new) — diagonal shimmer for card-level skeletons */
  .ask4-flow.ask4-b::after {
    content: ''; position: absolute; inset: -50%;
    background: linear-gradient(135deg,transparent 30%,var(--ask4-shine) 50%,transparent 70%);
    animation: ask4-fl calc(var(--ask4-dur)*1.4) ease-in-out infinite;
  }
  @keyframes ask4-fl { 0%{transform:translate(-100%,-100%)} 100%{transform:translate(100%,100%)} }

  .ask4-none.ask4-b { opacity:.45; }

  /* stagger */
  .ask4-stagger > *:nth-child(1) { animation-delay: calc(var(--ask4-stagger)*0); }
  .ask4-stagger > *:nth-child(2) { animation-delay: calc(var(--ask4-stagger)*1); }
  .ask4-stagger > *:nth-child(3) { animation-delay: calc(var(--ask4-stagger)*2); }
  .ask4-stagger > *:nth-child(4) { animation-delay: calc(var(--ask4-stagger)*3); }
  .ask4-stagger > *:nth-child(5) { animation-delay: calc(var(--ask4-stagger)*4); }
  .ask4-stagger > *:nth-child(6) { animation-delay: calc(var(--ask4-stagger)*5); }
  .ask4-stagger > *:nth-child(7) { animation-delay: calc(var(--ask4-stagger)*6); }
  .ask4-stagger > *:nth-child(8) { animation-delay: calc(var(--ask4-stagger)*7); }

  /* coarse pointer (touch devices) — slightly taller blocks */
  @media (pointer: coarse) {
    .ask4-b { min-height: 18px; }
  }

  /* transitions */
  .ask4-fade    { animation: ask4-fi  .3s  ease both; }
  .ask4-slideup { animation: ask4-su  .38s cubic-bezier(.22,1,.36,1) both; }
  .ask4-scale   { animation: ask4-sc2 .25s ease both; }
  .ask4-morph   { animation: ask4-mo  .35s cubic-bezier(.34,1.56,.64,1) both; }
  @keyframes ask4-fi  { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:none} }
  @keyframes ask4-su  { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:none} }
  @keyframes ask4-sc2 { from{opacity:0;transform:scale(.94)} to{opacity:1;transform:none} }
  @keyframes ask4-mo  { from{opacity:0;transform:scale(.96) translateY(4px)} to{opacity:1;transform:none} }

  .ask4-wrap { pointer-events:none; user-select:none; }

  /* forced-colors */
  @media (forced-colors: active) {
    .ask4-b { background: ButtonFace; border: 1px solid ButtonText; }
    .ask4-b::after { display: none; }
  }
  /* reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .ask4-shimmer.ask4-b::after,.ask4-wave.ask4-b::after,
    .ask4-scan.ask4-b::after,.ask4-flow.ask4-b::after { animation:none; background:none; }
    .ask4-shimmer.ask4-b,.ask4-wave.ask4-b,.ask4-pulse.ask4-b,
    .ask4-glow.ask4-b,.ask4-scan.ask4-b,.ask4-flow.ask4-b,.ask4-blink.ask4-b {
      animation: ask4-pu calc(var(--ask4-dur)*2.5) ease-in-out infinite;
    }
  }
}
`;

let _injected = false;
function injectStyles() {
  if (_injected) return;
  if (typeof document === 'undefined') { _injected = true; return; }
  if (document.getElementById(STYLE_ID)) { _injected = true; return; }
  const s = document.createElement('style');
  s.id = STYLE_ID; s.textContent = BASE_CSS;
  document.head.appendChild(s);
  _injected = true;
}

/* ── 12 theme presets ── */
const THEMES = {
  default:  {},
  dark:     { '--ask4-base':'#1a202c', '--ask4-shine':'rgba(255,255,255,0.04)' },
  minimal:  { '--ask4-base':'#f1f5f9', '--ask4-shine':'rgba(255,255,255,0.92)', '--ask4-dur':'1.8s' },
  soft:     { '--ask4-base':'#ede9fe', '--ask4-shine':'rgba(255,255,255,0.72)', '--ask4-radius':'8px' },
  brand:    { '--ask4-base':'#dbeafe', '--ask4-shine':'rgba(255,255,255,0.78)', '--ask4-dur':'1.1s' },
  warm:     { '--ask4-base':'#fef3c7', '--ask4-shine':'rgba(255,255,255,0.72)' },
  ocean:    { '--ask4-base':'#0c4a6e', '--ask4-shine':'rgba(186,230,253,0.15)' },
  neon:     { '--ask4-base':'#0f172a', '--ask4-shine':'rgba(99,102,241,0.28)', '--ask4-dur':'.9s' },
  glass:    { '--ask4-base':'rgba(255,255,255,0.08)', '--ask4-shine':'rgba(255,255,255,0.15)', '--ask4-radius':'12px' },
  // V4 new
  aurora:   { '--ask4-base':'#1a1a2e', '--ask4-shine':'rgba(147,51,234,0.2)', '--ask4-dur':'1.6s', '--ask4-radius':'6px' },
  midnight: { '--ask4-base':'#020617', '--ask4-shine':'rgba(99,102,241,0.15)', '--ask4-dur':'2s' },
  chalk:    { '--ask4-base':'#f8f8f5', '--ask4-shine':'rgba(255,255,255,0.95)', '--ask4-dur':'2s', '--ask4-radius':'2px' },
  paper:    { '--ask4-base':'#fdf8f0', '--ask4-shine':'rgba(255,255,255,0.85)', '--ask4-radius':'3px' },
};

const KEY_MAP = {
  baseColor:'--ask4-base', shineColor:'--ask4-shine', highlightColor:'--ask4-shine',
  shimmerColor:'--ask4-shine', duration:'--ask4-dur', borderRadius:'--ask4-radius',
  stagger:'--ask4-stagger', lineHeight:'--ask4-line-h',
};

function buildThemeStyle(preset, overrides) {
  const base = THEMES[preset||'default'] || {};
  const merged = { ...base };
  if (overrides) Object.keys(overrides).forEach(k => { merged[KEY_MAP[k]||k] = overrides[k]; });
  return merged;
}

function blockClass(animation, shape) {
  const a = animation||'shimmer';
  return ['ask4-b', `ask4-${a}`, shape?`ask4-${shape}`:''].filter(Boolean).join(' ');
}

/* ── per-instance scoped theme injection ── */
const _injectedIds = new Set();
function injectInstanceTheme(id, vars) {
  if (!id || typeof document === 'undefined' || _injectedIds.has(id)) return;
  if (document.getElementById('ask4-t-'+id)) { _injectedIds.add(id); return; }
  const rules = Object.entries(vars).map(([k,v]) => `  ${k}:${v};`).join('\n');
  const s = document.createElement('style');
  s.id = 'ask4-t-'+id;
  s.textContent = `[data-ask4="${id}"] {\n${rules}\n}`;
  document.head.appendChild(s);
  _injectedIds.add(id);
}

module.exports = { injectStyles, injectInstanceTheme, blockClass, buildThemeStyle, THEMES, BASE_CSS };
