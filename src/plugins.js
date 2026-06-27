'use strict';
/* plugins.js — V4 (same API as V3, enhanced helpers) */
const React  = require('react');
const styles = require('./styles');
const _plugins = [];

const helpers = {
  cls:  el => ((el.props&&el.props.className)||'').toLowerCase(),
  tag:  el => typeof el.type==='string'?el.type.toLowerCase():null,
  prop: (el,k) => el.props&&el.props[k],
  block(animation, shape, style) {
    return React.createElement('span', {
      key: Math.random().toString(36).slice(2,7),
      className: styles.blockClass(animation||'shimmer', shape),
      style: { display:'block', width:'100%', height:'20px', ...style },
      'aria-hidden':'true',
    });
  },
};

function registerPlugin(p) {
  if (!p||!p.name) throw new Error('ask4: plugin must have a name');
  const i = _plugins.findIndex(x=>x.name===p.name);
  if (i>=0) _plugins.splice(i,1,p); else _plugins.push(p);
}
function unregisterPlugin(name) { const i=_plugins.findIndex(p=>p.name===name); if(i>=0)_plugins.splice(i,1); }
function listPlugins() { return _plugins.map(p=>p.name); }
function runBeforeAnalyze(el, opts) { _plugins.forEach(p=>p.beforeAnalyze&&p.beforeAnalyze(el,opts)); }
function runAnalyzerPlugins(el, depth, opts) { for(const p of _plugins){if(typeof p.analyze==='function'){const r=p.analyze(el,helpers,{depth,opts});if(r)return r;}}return null; }
function runRendererPlugins(node, opts) { for(const p of _plugins){if(typeof p.render==='function'){const r=p.render(node,opts,helpers);if(r)return r;}}return null; }
function runAfterRender(rendered, node, opts) { _plugins.forEach(p=>p.afterRender&&p.afterRender(rendered,node,opts)); }

module.exports = { registerPlugin, unregisterPlugin, listPlugins, runBeforeAnalyze, runAnalyzerPlugins, runRendererPlugins, runAfterRender };
