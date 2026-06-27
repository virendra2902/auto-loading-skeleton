'use strict';
/**
 * hooks.js — V4
 * All V3 hooks retained. New additions:
 *  - useSkeletonStream: for React 18 streaming / incremental data arrival
 *  - useSkeletonPagination: skeleton that tracks paginated loading state
 *  - useSkeletonForm: tracks per-field loading state for complex forms
 *  - useSkeletonPreload: preloads skeleton descriptor in idle time
 */
const React = require('react');

/* ── V3 hooks (unchanged) ── */
function useSkeleton(init, opts) {
  const [loading, setLoading] = React.useState(init !== undefined ? init : true);
  return { loading, setLoading, skeletonProps: { loading, ...(opts||{}) } };
}

function useSkeletonDelay(loading, delay) {
  delay = delay != null ? delay : 200;
  const ref = React.useRef(null);
  const [show, setShow] = React.useState(false);
  React.useEffect(() => {
    if (loading) { ref.current = setTimeout(() => setShow(true), delay); }
    else { if (ref.current) clearTimeout(ref.current); setShow(false); }
    return () => { if (ref.current) clearTimeout(ref.current); };
  }, [loading, delay]);
  return show;
}

function useSkeletonTimeout(loading, min) {
  min = min != null ? min : 500;
  const startRef = React.useRef(null);
  const [show, setShow] = React.useState(loading);
  React.useEffect(() => {
    if (loading) { startRef.current = Date.now(); setShow(true); }
    else {
      const rem = Math.max(0, min - (Date.now() - (startRef.current||Date.now())));
      const tid = setTimeout(() => setShow(false), rem);
      return () => clearTimeout(tid);
    }
  }, [loading, min]);
  return show;
}

function useSkeletonData(fetchFn, deps) {
  deps = deps || [];
  const [data, setData]     = React.useState(null);
  const [loading, setLoad]  = React.useState(true);
  const [error, setError]   = React.useState(null);
  const cancel = React.useRef(false);
  React.useEffect(() => {
    cancel.current = false; setLoad(true); setError(null);
    Promise.resolve(fetchFn()).then(r => { if(!cancel.current){setData(r);setLoad(false);} })
      .catch(e => { if(!cancel.current){setError(e);setLoad(false);} });
    return () => { cancel.current = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return { data, loading, error };
}

function useSkeletonGroup(keys, mode) {
  mode = mode || 'all';
  const init = {};
  (keys||[]).forEach(k => { init[k] = true; });
  const [state, setState] = React.useState(init);
  const setKey = (key, val) => setState(prev => ({ ...prev, [key]: val }));
  const vals = Object.values(state);
  const loading = mode === 'all' ? vals.some(v=>v) : vals.every(v=>v);
  return { loading, setKey, state, setAll: v => { const n={}; Object.keys(state).forEach(k=>{n[k]=v;}); setState(n); } };
}

function useSkeletonRetry(fetchFn, options, deps) {
  options = options || {}; deps = deps || [];
  const maxRetries = options.maxRetries ?? 3;
  const baseDelay  = options.baseDelay  ?? 500;
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [retryCount, setRC] = React.useState(0);
  const cancel = React.useRef(false);
  React.useEffect(() => {
    cancel.current = false; setLoading(true); setError(null); setRC(0);
    let attempt = 0;
    function run() {
      Promise.resolve(fetchFn()).then(r => { if(!cancel.current){setData(r);setLoading(false);} })
        .catch(e => {
          if (cancel.current) return;
          if (attempt < maxRetries) { attempt++; setRC(attempt); setTimeout(run, baseDelay*Math.pow(2,attempt-1)); }
          else { setError(e); setLoading(false); }
        });
    }
    run();
    return () => { cancel.current = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return { data, loading, error, retryCount };
}

function useSkeletonIntersection(fetchFn, options) {
  options = options || {};
  const ref = React.useRef(null);
  const [visible, setVisible] = React.useState(false);
  const { data, loading, error } = useSkeletonData(
    () => visible ? fetchFn() : Promise.resolve(null), [visible]
  );
  React.useEffect(() => {
    if (!ref.current || typeof IntersectionObserver === 'undefined') { setVisible(true); return; }
    const obs = new IntersectionObserver(([e]) => { if(e.isIntersecting){setVisible(true);obs.disconnect();} },
      { threshold: options.threshold||0.1, rootMargin: options.rootMargin||'0px' });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return { ref, data, loading: loading||!visible, error };
}

/* ── V4 NEW HOOKS ── */

/**
 * useSkeletonStream(fetchFn, deps)
 *
 * Designed for React 18 streaming responses (SSR streaming / incremental data).
 * Returns a chunks array that grows as data arrives, plus a loading flag per chunk.
 *
 * fetchFn should return an async iterable or a ReadableStream.
 * Falls back to regular fetch if not an iterable.
 */
function useSkeletonStream(fetchFn, deps) {
  deps = deps || [];
  const [chunks, setChunks] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const cancel = React.useRef(false);

  React.useEffect(() => {
    cancel.current = false;
    setChunks([]); setLoading(true); setError(null);

    async function run() {
      try {
        const result = await fetchFn();
        // If result is async iterable (e.g. ReadableStream reader)
        if (result && typeof result[Symbol.asyncIterator] === 'function') {
          for await (const chunk of result) {
            if (cancel.current) break;
            setChunks(prev => [...prev, chunk]);
          }
        } else {
          // Regular value — treat as single chunk
          if (!cancel.current) setChunks([result]);
        }
        if (!cancel.current) setLoading(false);
      } catch(e) {
        if (!cancel.current) { setError(e); setLoading(false); }
      }
    }
    run();
    return () => { cancel.current = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { chunks, loading, error, isEmpty: chunks.length === 0 };
}

/**
 * useSkeletonPagination(fetchFn, options)
 *
 * Manages paginated data loading. Each page load shows a skeleton
 * only for the incoming page, not the whole list.
 *
 * Returns { data, loading, pageLoading, loadMore, page, hasMore }
 */
function useSkeletonPagination(fetchFn, options) {
  options = options || {};
  const pageSize = options.pageSize || 10;

  const [data, setData]           = React.useState([]);
  const [loading, setLoading]     = React.useState(true);   // initial load
  const [pageLoading, setPageLoad]= React.useState(false);  // subsequent pages
  const [page, setPage]           = React.useState(1);
  const [hasMore, setHasMore]     = React.useState(true);
  const [error, setError]         = React.useState(null);
  const cancel = React.useRef(false);

  async function load(p, initial) {
    cancel.current = false;
    if (initial) setLoading(true); else setPageLoad(true);
    setError(null);
    try {
      const result = await fetchFn({ page: p, pageSize });
      if (!cancel.current) {
        const items = Array.isArray(result) ? result : (result.items || result.data || []);
        setData(prev => initial ? items : [...prev, ...items]);
        setHasMore(items.length >= pageSize);
        if (initial) setLoading(false); else setPageLoad(false);
      }
    } catch(e) {
      if (!cancel.current) { setError(e); setLoading(false); setPageLoad(false); }
    }
  }

  React.useEffect(() => { load(1, true); return () => { cancel.current = true; }; }, []);

  function loadMore() {
    if (pageLoading || !hasMore) return;
    const next = page + 1;
    setPage(next);
    load(next, false);
  }

  return { data, loading, pageLoading, loadMore, page, hasMore, error };
}

/**
 * useSkeletonForm(fields)
 *
 * Tracks per-field loading state for complex forms where different
 * fields load from different sources (e.g. user profile + org data).
 *
 * fields: ['name', 'email', 'company', 'role']
 * Returns { loading, fieldLoading, setField, allReady }
 */
function useSkeletonForm(fields) {
  const init = {};
  (fields||[]).forEach(f => { init[f] = true; });
  const [state, setState] = React.useState(init);

  const setField = (field, val) => setState(prev => ({ ...prev, [field]: val }));
  const loading  = Object.values(state).some(Boolean);
  const allReady = !loading;

  return { loading, fieldLoading: state, setField, allReady };
}

/**
 * useSkeletonPreload(children, opts)
 *
 * Preloads the skeleton descriptor during idle time (requestIdleCallback)
 * so the first loading state renders with zero analysis overhead.
 */
function useSkeletonPreload(children, opts) {
  const cache = require('./cache');
  const { analyzeElement } = require('./analyzer');

  React.useEffect(() => {
    if (cache.get(children)) return; // already cached
    const preload = () => {
      const descriptor = analyzeElement(children, 0, opts||{});
      cache.set(children, descriptor);
    };
    if (typeof requestIdleCallback !== 'undefined') {
      const id = requestIdleCallback(preload, { timeout: 2000 });
      return () => cancelIdleCallback(id);
    } else {
      const tid = setTimeout(preload, 100);
      return () => clearTimeout(tid);
    }
  }, []);
}

/* ── withSkeleton HOC ── */
function withSkeleton(WrappedComponent, defaults) {
  defaults = defaults || {};
  const name = WrappedComponent.displayName || WrappedComponent.name || 'Component';
  const AutoSkeleton = require('./AutoSkeleton');
  function Wrapped(props) {
    const { loading=false, skeletonAnimation, skeletonTheme, skeletonCount, skeletonTransition, ...rest } = props;
    return React.createElement(AutoSkeleton, {
      loading, animation:skeletonAnimation||defaults.animation||'shimmer',
      theme:skeletonTheme||defaults.theme||'default',
      count:skeletonCount||defaults.count||1,
      transition:skeletonTransition||defaults.transition||'fade',
    }, React.createElement(WrappedComponent, rest));
  }
  Wrapped.displayName = 'WithSkeleton(' + name + ')';
  return Wrapped;
}

module.exports = {
  useSkeleton, useSkeletonDelay, useSkeletonTimeout, useSkeletonData,
  useSkeletonGroup, useSkeletonRetry, useSkeletonIntersection,
  useSkeletonStream, useSkeletonPagination, useSkeletonForm, useSkeletonPreload,
  withSkeleton,
};
