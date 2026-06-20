'use strict';

/**
 * hooks.js — V2
 *
 * useSkeleton        — basic loading state manager
 * useSkeletonDelay   — avoids flash of skeleton for fast responses
 * useSkeletonData    — async data fetcher that integrates loading state
 * useSkeletonTimeout — shows skeleton for a minimum duration to avoid flicker
 */

var React = require('react');

/**
 * useSkeleton(initialLoading, options)
 * Returns { loading, setLoading, skeletonProps }
 */
function useSkeleton(initialLoading, options) {
  initialLoading = initialLoading !== undefined ? initialLoading : true;
  options        = options || {};
  var state      = React.useState(initialLoading);
  var loading    = state[0];
  var setLoading = state[1];
  return {
    loading:      loading,
    setLoading:   setLoading,
    skeletonProps: Object.assign({ loading: loading }, options),
  };
}

/**
 * useSkeletonDelay(loading, delay)
 *
 * Prevents skeleton flash for responses faster than `delay` ms.
 * The skeleton only appears if loading has been true for longer than `delay`.
 *
 * Example: delay=200 means quick responses never show a skeleton at all.
 */
function useSkeletonDelay(loading, delay) {
  delay = delay != null ? delay : 200;
  var ref   = React.useRef(null);
  var state = React.useState(false);
  var show  = state[0];
  var setShow = state[1];

  React.useEffect(function() {
    if (loading) {
      ref.current = setTimeout(function() { setShow(true); }, delay);
    } else {
      if (ref.current) clearTimeout(ref.current);
      setShow(false);
    }
    return function() { if (ref.current) clearTimeout(ref.current); };
  }, [loading, delay]);

  return show;
}

/**
 * useSkeletonTimeout(loading, minDuration)
 *
 * Keeps the skeleton visible for at least `minDuration` ms even if data
 * arrives early — avoids jarring instant transitions.
 */
function useSkeletonTimeout(loading, minDuration) {
  minDuration    = minDuration != null ? minDuration : 500;
  var startRef   = React.useRef(null);
  var state      = React.useState(loading);
  var show       = state[0];
  var setShow    = state[1];

  React.useEffect(function() {
    if (loading) {
      startRef.current = Date.now();
      setShow(true);
    } else {
      var elapsed  = Date.now() - (startRef.current || Date.now());
      var remaining = Math.max(0, minDuration - elapsed);
      var tid = setTimeout(function() { setShow(false); }, remaining);
      return function() { clearTimeout(tid); };
    }
  }, [loading, minDuration]);

  return show;
}

/**
 * useSkeletonData(fetchFn, deps)
 *
 * Runs an async fetch function and returns { data, loading, error }.
 * fetchFn should return a Promise.
 *
 * Example:
 *   const { data, loading } = useSkeletonData(() => fetch('/api/user').then(r => r.json()), [userId]);
 */
function useSkeletonData(fetchFn, deps) {
  deps = deps || [];
  var dataState  = React.useState(null);
  var loadState  = React.useState(true);
  var errState   = React.useState(null);
  var data       = dataState[0]; var setData  = dataState[1];
  var loading    = loadState[0]; var setLoad  = loadState[1];
  var error      = errState[0];  var setError = errState[1];
  var cancelRef  = React.useRef(false);

  React.useEffect(function() {
    cancelRef.current = false;
    setLoad(true);
    setError(null);
    Promise.resolve(fetchFn()).then(function(result) {
      if (!cancelRef.current) {
        setData(result);
        setLoad(false);
      }
    }).catch(function(err) {
      if (!cancelRef.current) {
        setError(err);
        setLoad(false);
      }
    });
    return function() { cancelRef.current = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data: data, loading: loading, error: error };
}

/**
 * withSkeleton(WrappedComponent, defaultOptions)
 * Higher-order component version.
 */
function withSkeleton(WrappedComponent, defaultOptions) {
  defaultOptions = defaultOptions || {};
  var name       = WrappedComponent.displayName || WrappedComponent.name || 'Component';
  var AutoSkeleton = require('./AutoSkeleton');

  function WithSkeletonWrapper(props) {
    var loading          = props.loading !== undefined ? props.loading : false;
    var animation        = props.skeletonAnimation;
    var theme            = props.skeletonTheme;
    var themeOverrides   = props.skeletonThemeOverrides;
    var count            = props.skeletonCount;
    var rest = Object.assign({}, props);
    delete rest.loading;
    delete rest.skeletonAnimation;
    delete rest.skeletonTheme;
    delete rest.skeletonThemeOverrides;
    delete rest.skeletonCount;
    return React.createElement(AutoSkeleton, {
      loading:       loading,
      animation:     animation || defaultOptions.animation || 'shimmer',
      theme:         theme     || defaultOptions.theme     || 'default',
      themeOverrides:themeOverrides || defaultOptions.themeOverrides || {},
      count:         count     || defaultOptions.count     || 1,
    }, React.createElement(WrappedComponent, rest));
  }
  WithSkeletonWrapper.displayName = 'WithSkeleton(' + name + ')';
  return WithSkeletonWrapper;
}

module.exports = { useSkeleton, useSkeletonDelay, useSkeletonTimeout, useSkeletonData, withSkeleton };
