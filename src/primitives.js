'use strict';

/**
 * primitives.js — V2
 *
 * Standalone skeleton building blocks for manual composition.
 * All respect the global SkeletonContext for animation / theme.
 *
 * Exports:
 *   SkeletonBlock   — generic configurable rectangle
 *   SkeletonText    — multi-line text placeholder
 *   SkeletonAvatar  — circular avatar
 *   SkeletonImage   — rectangular image placeholder
 *   SkeletonBadge   — inline pill badge
 *   SkeletonButton  — button placeholder
 *   SkeletonInput   — input field placeholder
 *   SkeletonList    — repeated item skeleton
 *   SkeletonForm    — form with label+input rows
 *   SkeletonCard    — card with header row + body lines + optional footer
 */

var React           = require('react');
var styles          = require('./styles');
var ctx             = require('./context');

function useAnim(propAnim) {
  var context = React.useContext(ctx.SkeletonContext);
  React.useEffect(function() { styles.injectStyles(); }, []);
  if (typeof document !== 'undefined') styles.injectStyles();
  return propAnim || context.animation || 'shimmer';
}

/* ── SkeletonBlock ── */
function SkeletonBlock(props) {
  var anim  = useAnim(props.animation);
  var shape = props.shape;   // 'circle' | 'pill' | 'rounded' | undefined
  return React.createElement('span', {
    'data-ask':    '',
    className:     styles.blockClass(anim, shape) + (props.className ? ' ' + props.className : ''),
    style:         Object.assign({
      width:   props.width  || '100%',
      height:  props.height || '16px',
      display: 'block',
    }, props.style || {}),
    'aria-hidden': 'true',
  });
}
SkeletonBlock.displayName = 'SkeletonBlock';

/* ── SkeletonText ── */
function SkeletonText(props) {
  var anim      = useAnim(props.animation);
  var lines     = props.lines     || 3;
  var lineH     = props.lineHeight || '1em';
  var gap       = props.gap       || '7px';
  var lastWidth = props.lastLineWidth || '60%';
  var lineEls   = [];
  for (var i = 0; i < lines; i++) {
    lineEls.push(React.createElement('span', {
      key:           'tl-' + i,
      'data-ask':    '',
      className:     styles.blockClass(anim),
      style: {
        display:      'block',
        width:        i === lines - 1 ? lastWidth : (i === 0 ? '95%' : '100%'),
        height:       lineH,
        marginBottom: i < lines - 1 ? gap : 0,
      },
      'aria-hidden': 'true',
    }));
  }
  return React.createElement('div', { 'aria-hidden': 'true', style: props.style || {} }, lineEls);
}
SkeletonText.displayName = 'SkeletonText';

/* ── SkeletonAvatar ── */
function SkeletonAvatar(props) {
  var anim = useAnim(props.animation);
  var size = props.size || '40px';
  return React.createElement('span', {
    'data-ask':    '',
    className:     styles.blockClass(anim, 'circle'),
    style:         Object.assign({ width: size, height: size, display: 'block', flexShrink: 0 }, props.style || {}),
    'aria-hidden': 'true',
  });
}
SkeletonAvatar.displayName = 'SkeletonAvatar';

/* ── SkeletonImage ── */
function SkeletonImage(props) {
  var anim = useAnim(props.animation);
  return React.createElement('span', {
    'data-ask':    '',
    className:     styles.blockClass(anim, 'rounded'),
    style:         Object.assign({ width: '100%', height: props.height || '200px', display: 'block' }, props.style || {}),
    'aria-hidden': 'true',
  });
}
SkeletonImage.displayName = 'SkeletonImage';

/* ── SkeletonBadge ── */
function SkeletonBadge(props) {
  var anim = useAnim(props.animation);
  return React.createElement('span', {
    'data-ask':    '',
    className:     styles.blockClass(anim, 'pill'),
    style:         Object.assign({ width: props.width || '60px', height: '20px', display: 'inline-block' }, props.style || {}),
    'aria-hidden': 'true',
  });
}
SkeletonBadge.displayName = 'SkeletonBadge';

/* ── SkeletonButton ── */
function SkeletonButton(props) {
  var anim = useAnim(props.animation);
  return React.createElement('span', {
    'data-ask':    '',
    className:     styles.blockClass(anim, 'pill'),
    style:         Object.assign({ width: props.width || '100px', height: props.height || '36px', display: 'block' }, props.style || {}),
    'aria-hidden': 'true',
  });
}
SkeletonButton.displayName = 'SkeletonButton';

/* ── SkeletonInput ── */
function SkeletonInput(props) {
  var anim = useAnim(props.animation);
  return React.createElement('span', {
    'data-ask':    '',
    className:     styles.blockClass(anim, 'rounded'),
    style:         Object.assign({ width: '100%', height: props.height || '38px', display: 'block' }, props.style || {}),
    'aria-hidden': 'true',
  });
}
SkeletonInput.displayName = 'SkeletonInput';

/* ── SkeletonList ── */
function SkeletonList(props) {
  var anim    = useAnim(props.animation);
  var count   = props.count   || 3;
  var gap     = props.gap     || '12px';
  var rowH    = props.rowHeight || '60px';
  var items   = [];
  for (var i = 0; i < count; i++) {
    items.push(
      props.renderItem
        ? React.createElement('div', { key: i }, props.renderItem({ animation: anim, index: i }))
        : React.createElement('span', {
            key:           i,
            'data-ask':    '',
            className:     styles.blockClass(anim, 'rounded'),
            style:         { width: '100%', height: rowH, display: 'block', marginBottom: i < count - 1 ? gap : 0 },
            'aria-hidden': 'true',
          })
    );
  }
  return React.createElement('div', { role: 'status', 'aria-label': 'Loading list', 'aria-busy': 'true' }, items);
}
SkeletonList.displayName = 'SkeletonList';

/* ── SkeletonForm ── */
function SkeletonForm(props) {
  var anim   = useAnim(props.animation);
  var fields = props.fields || 3;
  var rows   = [];
  for (var i = 0; i < fields; i++) {
    rows.push(React.createElement('div', { key: i, style: { marginBottom: '16px' } },
      // label line
      React.createElement('span', {
        'data-ask':    '',
        className:     styles.blockClass(anim),
        style:         { width: '120px', height: '0.8em', display: 'block', marginBottom: '6px' },
        'aria-hidden': 'true',
      }),
      // input box
      React.createElement('span', {
        'data-ask':    '',
        className:     styles.blockClass(anim, 'rounded'),
        style:         { width: '100%', height: '38px', display: 'block' },
        'aria-hidden': 'true',
      })
    ));
  }
  // Submit button
  rows.push(React.createElement('span', {
    key:           'submit',
    'data-ask':    '',
    className:     styles.blockClass(anim, 'pill'),
    style:         { width: '120px', height: '38px', display: 'block', marginTop: '8px' },
    'aria-hidden': 'true',
  }));
  return React.createElement('div', { role: 'status', 'aria-busy': 'true', 'aria-label': 'Loading form' }, rows);
}
SkeletonForm.displayName = 'SkeletonForm';

/* ── SkeletonCard ── */
function SkeletonCard(props) {
  var anim      = useAnim(props.animation);
  var showImg   = props.image   !== false;
  var showAvatar = props.avatar !== false;
  var lines     = props.lines   || 3;
  var showFooter = props.footer !== false;
  var imgH      = props.imageHeight || '180px';

  var parts = [];
  if (showImg) parts.push(
    React.createElement('span', {
      key:           'img',
      'data-ask':    '',
      className:     styles.blockClass(anim, 'rounded'),
      style:         { width: '100%', height: imgH, display: 'block', marginBottom: '12px' },
      'aria-hidden': 'true',
    })
  );

  // header row: avatar + two text lines
  parts.push(React.createElement('div', {
    key:   'hdr',
    style: { display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '12px' },
  },
    showAvatar && React.createElement('span', {
      'data-ask':    '',
      className:     styles.blockClass(anim, 'circle'),
      style:         { width: '36px', height: '36px', flexShrink: 0 },
      'aria-hidden': 'true',
    }),
    React.createElement('div', { style: { flex: 1 } },
      React.createElement('span', {
        'data-ask':    '',
        className:     styles.blockClass(anim),
        style:         { width: '55%', height: '0.9em', display: 'block', marginBottom: '5px' },
        'aria-hidden': 'true',
      }),
      React.createElement('span', {
        'data-ask':    '',
        className:     styles.blockClass(anim),
        style:         { width: '35%', height: '0.75em', display: 'block' },
        'aria-hidden': 'true',
      })
    )
  ));

  // body text
  for (var i = 0; i < lines; i++) {
    parts.push(React.createElement('span', {
      key:           'line-' + i,
      'data-ask':    '',
      className:     styles.blockClass(anim),
      style:         {
        width:        i === lines - 1 ? '65%' : '100%',
        height:       '0.85em',
        display:      'block',
        marginBottom: i < lines - 1 ? '6px' : '12px',
      },
      'aria-hidden': 'true',
    }));
  }

  if (showFooter) {
    parts.push(React.createElement('div', {
      key:   'footer',
      style: { display: 'flex', gap: '8px' },
    },
      React.createElement('span', {
        'data-ask': '', className: styles.blockClass(anim, 'pill'),
        style: { width: '60px', height: '24px' }, 'aria-hidden': 'true',
      }),
      React.createElement('span', {
        'data-ask': '', className: styles.blockClass(anim, 'pill'),
        style: { width: '60px', height: '24px' }, 'aria-hidden': 'true',
      })
    ));
  }

  return React.createElement('div', {
    role: 'status', 'aria-busy': 'true', 'aria-label': 'Loading card',
    style: props.style || {},
  }, parts);
}
SkeletonCard.displayName = 'SkeletonCard';

module.exports = {
  SkeletonBlock,
  SkeletonText,
  SkeletonAvatar,
  SkeletonImage,
  SkeletonBadge,
  SkeletonButton,
  SkeletonInput,
  SkeletonList,
  SkeletonForm,
  SkeletonCard,
};
