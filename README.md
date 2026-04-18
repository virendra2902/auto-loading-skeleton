# auto-loading-skeleton 🦴

> Automatically generate loading skeleton UIs from your existing React components — no manual skeleton screens needed.

[![npm version](https://img.shields.io/npm/v/auto-loading-skeleton.svg)](https://www.npmjs.com/package/auto-loading-skeleton)
[![license](https://img.shields.io/npm/l/auto-loading-skeleton.svg)](LICENSE)

---

## The Problem

Every React developer has written this pattern manually:

```jsx
// ❌ The old way — maintain TWO versions of every component
{loading ? <SkeletonCard /> : <ProductCard product={data} />}
```

This means duplicating structure, breaking skeletons every time the real component changes, and wasting hours on boilerplate.

---

## The Solution

```jsx
// ✅ The new way — one wrapper, zero effort
import { AutoSkeleton } from 'auto-loading-skeleton';

<AutoSkeleton loading={loading}>
  <ProductCard product={data} />
</AutoSkeleton>
```

`AutoSkeleton` analyzes your component tree and automatically renders matching skeleton placeholders — preserving layout, spacing, and proportions.

---

## Installation

```bash
npm install auto-loading-skeleton
# or
yarn add auto-loading-skeleton
```

**Peer dependencies:** React >= 16.8

---

## Quick Start

```jsx
import React, { useState, useEffect } from 'react';
import { AutoSkeleton } from 'auto-loading-skeleton';

function App() {
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);

  useEffect(() => {
    fetchProduct().then(data => {
      setProduct(data);
      setLoading(false);
    });
  }, []);

  return (
    <AutoSkeleton loading={loading}>
      <ProductCard product={product} />
    </AutoSkeleton>
  );
}
```

---

## API Reference

### `<AutoSkeleton>`

| Prop        | Type      | Default      | Description                                          |
|-------------|-----------|--------------|------------------------------------------------------|
| `loading`   | `boolean` | **required** | Show skeleton when true, real content when false     |
| `animation` | `string`  | `'shimmer'`  | `'shimmer'` / `'pulse'` / `'wave'` / `'none'`       |
| `theme`     | `object`  | `{}`         | CSS custom property overrides (see Theming)          |
| `count`     | `number`  | `1`          | Repeat the skeleton N times (great for lists)        |
| `className` | `string`  | `''`         | Extra CSS class on the wrapper                       |
| `style`     | `object`  | `{}`         | Extra inline styles on the wrapper                   |

```jsx
<AutoSkeleton loading={isLoading} animation="wave" count={3}
  theme={{ baseColor: '#f0f0f0', duration: '1.2s' }}>
  <ArticleCard article={article} />
</AutoSkeleton>
```

---

### `<SkeletonBlock>`

A single configurable skeleton rectangle, circle, or pill.

```jsx
import { SkeletonBlock } from 'auto-loading-skeleton';

<SkeletonBlock width="200px" height="20px" />
<SkeletonBlock width="48px" height="48px" shape="circle" />
<SkeletonBlock width="120px" height="36px" shape="pill" animation="pulse" />
```

---

### `<SkeletonText>`

One or more text-line placeholders.

```jsx
import { SkeletonText } from 'auto-loading-skeleton';
<SkeletonText lines={4} lastLineWidth="50%" />
```

---

### `<SkeletonAvatar>`

A circular avatar placeholder.

```jsx
import { SkeletonAvatar } from 'auto-loading-skeleton';
<SkeletonAvatar size="56px" animation="pulse" />
```

---

### `useSkeleton` hook

```jsx
const { loading, setLoading, skeletonProps } = useSkeleton(true);

<AutoSkeleton {...skeletonProps} animation="wave">
  <ProfileCard />
</AutoSkeleton>
```

---

### `withSkeleton` HOC

```jsx
const SkeletonProductCard = withSkeleton(ProductCard, { animation: 'shimmer' });

// Just pass a `loading` prop alongside your component's own props
<SkeletonProductCard loading={isLoading} product={data} />
```

---

## Animations

| Value     | Description                         |
|-----------|-------------------------------------|
| `shimmer` | Left-to-right light sweep (default) |
| `pulse`   | Gentle fade in / fade out           |
| `wave`    | Soft ripple wave effect             |
| `none`    | Static blocks, no animation         |

---

## Theming

```jsx
<AutoSkeleton loading={loading} theme={{
  baseColor:    '#dde3ea',
  shimmerColor: 'rgba(255,255,255,0.6)',
  duration:     '1.2s',
  borderRadius: '6px',
}}>
  <MyComponent />
</AutoSkeleton>
```

Or globally via CSS custom properties:

```css
:root {
  --ask-base-color:    #dde3ea;
  --ask-shimmer-color: rgba(255, 255, 255, 0.6);
  --ask-duration:      1.2s;
  --ask-border-radius: 6px;
}
```

Dark mode is handled automatically via `@media (prefers-color-scheme: dark)`.

---

## How It Works

1. **Analyze** — Traverses the React element tree when `loading` is `true`
2. **Classify** — Tags each node as `text`, `image`, `avatar`, `button`, `input`, `icon`, or `container`
3. **Render** — Converts each node into a proportional skeleton block
4. **Animate** — Injects CSS animations once into `<head>`

### Element Detection

| Element / Pattern                     | Detected As   |
|---------------------------------------|---------------|
| `<img>`                               | IMAGE         |
| `<img className="avatar">`            | AVATAR        |
| `<button>`, `role="button"`           | BUTTON        |
| `<input>`, `<textarea>`, `<select>`   | INPUT         |
| `<svg>`, `.icon-*`                    | ICON          |
| `<h1>`–`<h6>` with text              | TEXT (heading)|
| `<p>`, `<span>` with text             | TEXT          |
| Any element with children             | CONTAINER     |

---

## List Skeletons

```jsx
<AutoSkeleton loading={loading} count={5}>
  <ProductCard product={sampleProduct} />
</AutoSkeleton>
```

---

## Low-Level API

```js
import { analyzeElement, renderNode, injectStyles } from 'auto-loading-skeleton';

const tree = analyzeElement(<MyComponent />);
const skeletonEl = renderNode(tree, { animation: 'shimmer' });
```

---

## License

MIT © Virendra Patil
