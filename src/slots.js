'use strict';
/**
 * slots.js — V4 (entirely new)
 *
 * Skeleton Slot System:
 *   Allows developers to mark explicit skeleton regions inside their
 *   components using <SkeletonSlot> — zero ambiguity, maximum control.
 *
 *   When AutoSkeleton renders, it checks if any children are SkeletonSlot
 *   elements. If so, it uses slot definitions directly instead of running
 *   the analyzer — giving you the speed of manual skeletons with the
 *   convenience of the AutoSkeleton wrapper.
 *
 * Usage:
 *   import { SkeletonSlot } from 'auto-loading-skeleton-v4';
 *
 *   function ProductCard({ product }) {
 *     return (
 *       <div>
 *         <SkeletonSlot name="image" type="image" height="200px" />
 *         <SkeletonSlot name="title" type="heading" width="70%" />
 *         <SkeletonSlot name="desc"  type="text"    lines={3} />
 *         <SkeletonSlot name="price" type="stat" />
 *         <SkeletonSlot name="btn"   type="button"  width="120px" />
 *         {/* Real content below — shown when loading=false */}
 *         <img src={product.image} />
 *         <h2>{product.title}</h2>
 *         <p>{product.desc}</p>
 *         <span className="price">{product.price}</span>
 *         <button>Add to cart</button>
 *       </div>
 *     );
 *   }
 *
 *   <AutoSkeleton loading={loading}>
 *     <ProductCard product={data} />
 *   </AutoSkeleton>
 */

const React = require('react');

const SLOT_TYPE = Symbol.for('ask4.slot');

/**
 * SkeletonSlot — marks an explicit skeleton region.
 * Renders nothing when loading=false (transparent passthrough).
 * When loading=true, AutoSkeleton replaces it with the correct skeleton block.
 */
function SkeletonSlot(props) {
  // Renders nothing in real component — slot metadata is read by AutoSkeleton
  return null;
}
SkeletonSlot.displayName = 'SkeletonSlot';
SkeletonSlot._slotType  = SLOT_TYPE;

/**
 * isSlotElement(element)
 * Returns true if an element is a SkeletonSlot.
 */
function isSlotElement(element) {
  return element &&
    typeof element === 'object' &&
    element.type &&
    element.type._slotType === SLOT_TYPE;
}

/**
 * collectSlots(element)
 * Recursively collects all SkeletonSlot elements from a React tree.
 * Returns array of slot prop objects.
 */
function collectSlots(element) {
  if (!element || typeof element !== 'object') return [];
  if (isSlotElement(element)) return [element.props];

  const children = element.props && element.props.children;
  if (!children) return [];

  const arr = Array.isArray(children) ? children : [children];
  return arr.flatMap(c => collectSlots(c));
}

/**
 * slotsToDescriptors(slots)
 * Converts slot props to analyzer-compatible descriptors.
 */
function slotsToDescriptors(slots) {
  const N = require('./analyzer').NODE;
  return slots.map(slot => {
    const base = { styleHints: {}, depth: 1, _conf: 1.0, _slot: true };
    if (slot.width)  base.styleHints.width  = slot.width;
    if (slot.height) base.styleHints.height = slot.height;
    switch (slot.type) {
      case 'image':    return { ...base, nodeType: N.IMAGE };
      case 'avatar':   return { ...base, nodeType: N.AVATAR };
      case 'heading':  return { ...base, nodeType: N.HEADING, level: slot.level||2, width: slot.width||'60%' };
      case 'text':     return { ...base, nodeType: N.TEXT, content: 'x'.repeat(slot.lines?slot.lines*40:80) };
      case 'button':   return { ...base, nodeType: N.BUTTON };
      case 'badge':    return { ...base, nodeType: N.BADGE };
      case 'icon':     return { ...base, nodeType: N.ICON };
      case 'stat':     return { ...base, nodeType: N.STAT };
      case 'progress': return { ...base, nodeType: N.PROGRESS };
      case 'rating':   return { ...base, nodeType: N.RATING, stars: slot.stars||5 };
      case 'code':     return { ...base, nodeType: N.CODE, lines: slot.lines||4 };
      case 'switch':   return { ...base, nodeType: N.SWITCH };
      case 'slider':   return { ...base, nodeType: N.SLIDER };
      case 'calendar': return { ...base, nodeType: N.CALENDAR };
      case 'map':      return { ...base, nodeType: N.MAP };
      case 'table':    return { ...base, nodeType: N.TABLE, rows: slot.rows||4, cols: slot.cols||4 };
      case 'nav':      return { ...base, nodeType: N.NAV };
      case 'divider':  return { ...base, nodeType: N.DIVIDER };
      case 'media':    return { ...base, nodeType: N.MEDIA };
      default:         return { ...base, nodeType: N.CONTAINER, children: [], tag: 'div' };
    }
  });
}

module.exports = { SkeletonSlot, isSlotElement, collectSlots, slotsToDescriptors, SLOT_TYPE };
