'use strict';
/* observer.js — V4 */
const React = require('react');
const cache = require('./cache');
const _obs = new Map();
function observe(key, node, cb) {
  if (typeof MutationObserver==='undefined'||!node) return;
  disconnect(key);
  const o = new MutationObserver(ms => {
    const rel = ms.some(m=>m.type==='childList'||(m.type==='attributes'&&['class','style'].includes(m.attributeName)));
    if (!rel) return;
    cache.clear();
    if (typeof cb==='function') cb(ms);
  });
  o.observe(node,{childList:true,subtree:true,attributes:true,attributeFilter:['class','style']});
  _obs.set(key,o);
}
function disconnect(key) { const o=_obs.get(key); if(o){o.disconnect();_obs.delete(key);} }
function disconnectAll() { _obs.forEach(o=>o.disconnect()); _obs.clear(); }
function useObservedSkeleton() {
  const keyRef = React.useRef('obs-'+Math.random().toString(36).slice(2,8));
  const domRef = React.useRef(null);
  const [rev, setRev] = React.useState(0);
  React.useEffect(() => {
    observe(keyRef.current, domRef.current, () => setRev(r=>r+1));
    return () => disconnect(keyRef.current);
  }, []);
  return { ref: domRef, key: keyRef.current, rev };
}
module.exports = { observe, disconnect, disconnectAll, useObservedSkeleton };
