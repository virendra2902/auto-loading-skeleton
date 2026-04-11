/**
 * SkeletonItem.jsx
 * Low-level primitive for manual skeleton building if needed.
 *
 * Usage:
 *   <SkeletonItem type="text" lines={2} />
 *   <SkeletonItem type="avatar" size={48} />
 *   <SkeletonItem type="image" width="100%" height={200} />
 */

import React, { useEffect } from 'react';
import { buildClassName, injectStyles } from './styles.js';

export function SkeletonItem({
  type = 'text',
  lines = 1,
  width,
  height,
  size,
  animation = 'shimmer',
  theme = {},
  style: extraStyle = {},
}) {
  useEffect(() => { injectStyles(); }, []);

  const cssVars = {
    ...(theme.baseColor && { '--skeleton-base-color': theme.baseColor }),
    ...(theme.highlightColor && { '--skeleton-highlight-color': theme.highlightColor }),
    ...extraStyle,
  };

  switch (type) {
    case 'text': {
      const cls = buildClassName(animation, 'auto-skeleton-text-line');
      if (lines === 1) {
        return React.createElement('div', {
          className: cls,
          style: { width: width || '80%', ...cssVars },
          'aria-hidden': true,
        });
      }
      const lineEls = Array.from({ length: lines }, (_, i) =>
        React.createElement('div', {
          key: i,
          className: cls,
          style: { width: i === lines - 1 ? '65%' : '100%', ...cssVars },
          'aria-hidden': true,
        })
      );
      return React.createElement('div', {
        className: 'auto-skeleton-text-block',
        style: cssVars,
        'aria-hidden': true,
      }, ...lineEls);
    }

    case 'avatar': {
      const px = size ? `${size}px` : (width || '40px');
      return React.createElement('div', {
        className: buildClassName(animation, 'auto-skeleton-avatar-block'),
        style: { width: px, height: size ? `${size}px` : (height || px), ...cssVars },
        'aria-hidden': true,
      });
    }

    case 'image': {
      return React.createElement('div', {
        className: buildClassName(animation, 'auto-skeleton-image-block'),
        style: {
          width: width || '100%',
          ...(height ? { paddingTop: 0, height } : {}),
          ...cssVars,
        },
        'aria-hidden': true,
      });
    }

    case 'button': {
      return React.createElement('div', {
        className: buildClassName(animation, 'auto-skeleton-button-block'),
        style: { width: width || 100, ...cssVars },
        'aria-hidden': true,
      });
    }

    case 'input': {
      return React.createElement('div', {
        className: 'auto-skeleton-input-block',
        style: cssVars,
        'aria-hidden': true,
      });
    }

    default:
      return null;
  }
}

export default SkeletonItem;
