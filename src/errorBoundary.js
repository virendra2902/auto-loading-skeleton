'use strict';
/* errorBoundary.js — V4 (same API as V3, updated class prefix) */
const React = require('react');
class SkeletonErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { err: null }; }
  static getDerivedStateFromError(e) { return { err: e }; }
  componentDidCatch(e, info) { if (typeof this.props.onError === 'function') this.props.onError(e, info); }
  render() {
    if (this.state.err) {
      if (this.props.fallback) return typeof this.props.fallback==='function'?this.props.fallback(this.state.err):this.props.fallback;
      return React.createElement('div', { style:{ width:'100%',minHeight:'40px',background:'var(--ask4-base,#e2e8f0)',borderRadius:'4px' }, 'aria-busy':'true', 'aria-label':'Loading' });
    }
    return this.props.children;
  }
}
SkeletonErrorBoundary.displayName = 'SkeletonErrorBoundary';
function withSkeletonErrorBoundary(C, ebProps) {
  function W(props) { return React.createElement(SkeletonErrorBoundary, ebProps||{}, React.createElement(C, props)); }
  W.displayName = 'WithSkeletonErrorBoundary('+(C.displayName||C.name||'Component')+')';
  return W;
}
module.exports = { SkeletonErrorBoundary, withSkeletonErrorBoundary };
