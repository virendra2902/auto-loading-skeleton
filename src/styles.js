const STYLE_ID = 'auto-skeleton-styles';

const CSS = `
.ask-block {
  display: inline-block;
  position: relative;
  overflow: hidden;
  background-color: var(--ask-base-color, #e2e8f0);
  border-radius: var(--ask-border-radius, 4px);
  vertical-align: middle;
}
.ask-shimmer::after {
  content: '';
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(90deg, transparent 0%, var(--ask-shimmer-color, rgba(255,255,255,0.55)) 50%, transparent 100%);
  animation: ask-shimmer var(--ask-duration, 1.4s) infinite;
}
@keyframes ask-shimmer { 100% { transform: translateX(100%); } }
.ask-pulse { animation: ask-pulse var(--ask-duration, 1.8s) ease-in-out infinite; }
@keyframes ask-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.45; } }
.ask-wave::after {
  content: '';
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(90deg, transparent 0%, var(--ask-shimmer-color, rgba(255,255,255,0.8)) 50%, transparent 100%);
  animation: ask-wave var(--ask-duration, 1.6s) ease-in-out infinite;
  overflow: hidden;
}
@keyframes ask-wave { 0% { transform: translateX(-100%); } 100% { transform: translateX(150%); } }
@media (prefers-color-scheme: dark) {
  .ask-block { background-color: var(--ask-base-color-dark, #2d3748); }
}
.ask-circle  { border-radius: 50%; }
.ask-rounded { border-radius: 8px; }
.ask-pill    { border-radius: 9999px; }
.ask-wrapper { pointer-events: none; user-select: none; }
`;

let injected = false;

function injectStyles() {
  if (injected || typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) { injected = true; return; }
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = CSS;
  document.head.appendChild(style);
  injected = true;
}

function blockClass(animation, shape) {
  animation = animation || 'shimmer';
  const parts = ['ask-block'];
  if (animation !== 'none') parts.push('ask-' + animation);
  if (shape) parts.push('ask-' + shape);
  return parts.join(' ');
}

function buildThemeVars(theme) {
  theme = theme || {};
  const map = {
    baseColor:    '--ask-base-color',
    shimmerColor: '--ask-shimmer-color',
    duration:     '--ask-duration',
    borderRadius: '--ask-border-radius',
  };
  return Object.entries(theme)
    .filter(function(pair) { return map[pair[0]]; })
    .map(function(pair) { return map[pair[0]] + ':' + pair[1]; })
    .join(';');
}

module.exports = { injectStyles, blockClass, buildThemeVars, CSS };
