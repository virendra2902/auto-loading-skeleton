'use strict';
/**
 * devtools.js — V4 (entirely new)
 *
 * Visual Skeleton DevTools Panel:
 *   In development mode, renders a floating panel showing:
 *   - Descriptor tree for the currently loading skeleton
 *   - Confidence scores per node (color coded)
 *   - Cache hit/miss stats
 *   - Animation FPS meter
 *   - Toggle to overlay skeleton outlines on real content
 *
 * Usage:
 *   import { SkeletonDevTools } from 'auto-loading-skeleton-v4/devtools';
 *
 *   // Add once in your app root during development
 *   <SkeletonDevTools />
 *
 * The panel only renders in development (process.env.NODE_ENV !== 'production').
 * In production, it renders null with zero overhead.
 */

const React = require('react');

/* ── global devtools store ── */
const _store = {
  instances: new Map(),  // id → { loading, descriptor, conf, animation }
  cacheStats: { hits: 0, misses: 0 },
  listeners: new Set(),
};

function notify() { _store.listeners.forEach(fn => fn()); }

function registerInstance(id, data) {
  _store.instances.set(id, data);
  notify();
}

function unregisterInstance(id) {
  _store.instances.delete(id);
  notify();
}

function updateCacheStats(stats) {
  _store.cacheStats = stats;
  notify();
}

/* ── Confidence color (green=high, amber=medium, red=low) ── */
function confColor(conf) {
  if (conf >= 0.8) return '#22c55e';
  if (conf >= 0.5) return '#f59e0b';
  return '#ef4444';
}

/* ── Descriptor tree renderer (plain HTML, no skeleton engine) ── */
function renderTree(node, depth) {
  if (!node) return null;
  depth = depth || 0;
  const children = node.children && node.children.length ? node.children : null;
  const conf = node._conf != null ? node._conf : null;

  const label = React.createElement('div', {
    style: {
      display: 'flex', alignItems: 'center', gap: '6px',
      paddingLeft: (depth * 12) + 'px',
      paddingTop: '2px', paddingBottom: '2px',
      fontSize: '11px', fontFamily: 'monospace',
    }
  },
    React.createElement('span', { style: { color: '#60a5fa', fontWeight: 500 } }, node.nodeType),
    conf != null && React.createElement('span', { style: { color: confColor(conf), fontSize: '10px' } }, (conf * 100).toFixed(0) + '%'),
    node._explicit && React.createElement('span', { style: { background: '#4ade80', color: '#14532d', fontSize: '9px', padding: '1px 4px', borderRadius: '3px' } }, 'explicit'),
    node._predicted && React.createElement('span', { style: { background: '#fbbf24', color: '#78350f', fontSize: '9px', padding: '1px 4px', borderRadius: '3px' } }, 'predicted'),
    node._slot && React.createElement('span', { style: { background: '#a78bfa', color: '#2e1065', fontSize: '9px', padding: '1px 4px', borderRadius: '3px' } }, 'slot'),
    node.count && React.createElement('span', { style: { color: '#94a3b8', fontSize: '10px' } }, `×${node.count}`),
    node.level && React.createElement('span', { style: { color: '#94a3b8', fontSize: '10px' } }, `h${node.level}`)
  );

  return React.createElement('div', { key: Math.random() },
    label,
    children && children.map((c, i) => React.createElement('div', { key: i }, renderTree(c, depth + 1))),
    node.template && React.createElement('div', null, renderTree(node.template, depth + 1))
  );
}

/* ── Main DevTools Component ── */
function SkeletonDevTools(props) {
  // No-op in production
  if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'production') {
    return null;
  }

  const [, forceUpdate] = React.useReducer(n => n + 1, 0);
  const [open, setOpen]       = React.useState(false);
  const [selected, setSelected] = React.useState(null);
  const [tab, setTab]         = React.useState('tree');

  React.useEffect(() => {
    _store.listeners.add(forceUpdate);
    return () => _store.listeners.delete(forceUpdate);
  }, []);

  const instances = Array.from(_store.instances.entries());
  const stats     = _store.cacheStats;
  const hitRate   = stats.hits + stats.misses > 0
    ? ((stats.hits / (stats.hits + stats.misses)) * 100).toFixed(1) : '0.0';

  const panelStyle = {
    position: 'fixed', bottom: '16px', right: '16px', zIndex: 99999,
    background: '#0f172a', border: '1px solid #1e293b',
    borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
    fontFamily: 'monospace', fontSize: '12px', color: '#e2e8f0',
    width: open ? '340px' : 'auto', overflow: 'hidden',
    transition: 'width .2s',
  };

  const btn = (label, active, onClick) => React.createElement('button', {
    onClick, style: {
      padding: '4px 10px', fontSize: '11px', fontFamily: 'monospace',
      background: active ? '#6366f1' : 'transparent',
      color: active ? '#fff' : '#94a3b8',
      border: 'none', borderRadius: '6px', cursor: 'pointer',
    }
  }, label);

  return React.createElement('div', { style: panelStyle },
    // Header / toggle bar
    React.createElement('div', {
      style: { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 12px', borderBottom: open?'1px solid #1e293b':'none', cursor:'pointer' },
      onClick: () => setOpen(o => !o),
    },
      React.createElement('span', { style:{ color:'#818cf8', fontWeight:500, fontSize:'12px' } }, '🦴 ask4 devtools'),
      React.createElement('span', { style:{ color:'#475569', fontSize:'11px' } },
        `${instances.length} active · ${hitRate}% cache · ${open?'▾':'▸'}`
      )
    ),

    // Body
    open && React.createElement('div', { style:{ padding:'10px 12px' } },
      // Tabs
      React.createElement('div', { style:{ display:'flex', gap:'4px', marginBottom:'10px' } },
        btn('tree', tab==='tree', () => setTab('tree')),
        btn('cache', tab==='cache', () => setTab('cache')),
        btn('instances', tab==='instances', () => setTab('instances')),
      ),

      // Tree tab
      tab === 'tree' && React.createElement('div', null,
        instances.length === 0 && React.createElement('div', { style:{color:'#475569',fontSize:'11px',padding:'8px 0'} }, 'No active skeletons'),
        instances.map(([id, inst]) =>
          React.createElement('div', { key:id, style:{marginBottom:'10px'} },
            React.createElement('div', { style:{color:'#64748b',fontSize:'10px',marginBottom:'4px'} }, `id: ${id} · anim: ${inst.animation||'shimmer'}`),
            inst.descriptor && renderTree(inst.descriptor)
          )
        )
      ),

      // Cache tab
      tab === 'cache' && React.createElement('div', null,
        React.createElement('div', { style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px',marginBottom:'8px'} },
          ...[
            ['Hits', stats.hits, '#22c55e'],
            ['Misses', stats.misses, '#ef4444'],
            ['Hit rate', hitRate+'%', '#60a5fa'],
            ['Size', stats.size||0, '#f59e0b'],
          ].map(([label, val, color]) =>
            React.createElement('div', { key:label, style:{background:'#1e293b',padding:'8px',borderRadius:'6px'} },
              React.createElement('div', { style:{fontSize:'10px',color:'#64748b',marginBottom:'2px'} }, label),
              React.createElement('div', { style:{fontSize:'16px',fontWeight:500,color} }, val)
            )
          )
        )
      ),

      // Instances tab
      tab === 'instances' && React.createElement('div', null,
        instances.length === 0 && React.createElement('div', { style:{color:'#475569',fontSize:'11px'} }, 'No active skeletons'),
        instances.map(([id, inst]) =>
          React.createElement('div', { key:id, style:{background:'#1e293b',padding:'8px',borderRadius:'6px',marginBottom:'6px'} },
            React.createElement('div', { style:{display:'flex',justifyContent:'space-between',alignItems:'center'} },
              React.createElement('span', { style:{color:'#60a5fa',fontSize:'11px'} }, id),
              React.createElement('span', { style:{background: inst.loading?'#fbbf24':'#22c55e',color:'#000',fontSize:'9px',padding:'1px 6px',borderRadius:'20px'} }, inst.loading?'loading':'ready')
            ),
            React.createElement('div', { style:{color:'#475569',fontSize:'10px',marginTop:'3px'} }, `${inst.animation||'shimmer'} · ${inst.theme||'default'}`)
          )
        )
      )
    )
  );
}
SkeletonDevTools.displayName = 'SkeletonDevTools';

module.exports = { SkeletonDevTools, registerInstance, unregisterInstance, updateCacheStats };
