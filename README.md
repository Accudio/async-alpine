# Async Alpine

Load Alpine Componenets asyncronously. Allows for code splitting and lazy loading components!

***This is still very experimental and is not ready for production use!***

## Table of Contents

- [Installation](#installation)
   - [CDN](#cdn-easy)
   - [npm](#npm)
- [Usage](#usage)
- [Strategies](#strategies)
   - [eager](#eager)
   - [idle](#idle)
   - [visible](#visible)
   - [media](#media)
   - [event](#event)
   - [Combine strategies](#combine-strategies)
- [Limitations and Todo](#limitations-and-todo)
- [License and Credits](#license-and-credits)

***

## Installation

There are two recommended methods of loading Async Alpine. Adding a `script` tag with a [CDN](#cdn) or importing it into your bundle with [npm](#npm).

Which method you use will depend on how you prefer to use and import Alpine.js.

### CDN (easy)

If you load Alpine from a CDN like [jsdelivr](https://www.jsdelivr.com/package/npm/async-alpine) or [unpkg](https://unpkg.com/async-alpine) with a script tag you can load Async Alpine via the same method:
```html
<script src="https://unpkg.com/async-alpine@0.1.x/dist/async-alpine.script.js"></script>
<script src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js"></script>
```

When loading via this method you need to make sure that Async Alpine loads first. This is generally done by including the `script` tag for Async Alpine *before* Alpine. Watch out for using `type="module"` or `async`.

### npm

Install from [npm](https://www.npmjs.com/package/async-alpine) with:
```
npm install async-alpine
```

Import it into your bundle alongside Alpine and run it before `Alpine.start()`, passing in `Alpine` as an argument:
```js
import Alpine from 'Alpine.js';
import AsyncAlpine from 'async-alpine'

AsyncAlpine(Alpine)

Alpine.start()
```

***

## Usage

There are a couple requirements for Async Alpine to work with your setup:
- Alpine 3;
- Components `export`ed from an ES Module that is publicly accessible;

Depending on how you write your JavaScript, providing ES Module versions of your components will vary in difficulty. You're looking for something like this, whether bundled or hand-written:

```js
// publicly available at `/assets/path-to-component.js`
export default function myComponent() {
  return {
    message: '',

    init() {
      this.message = 'my component has initialised!'
    }
  }
}
```

Once you have that, using Async Alpine ends up being fairly straightforward!

First add the `ax-load` attribute to your component. You can optionally specify a [loading strategy](#strategies) here.
Then set the `ax-load-src` attribute to the URL to your component.

Use Alpine normally within that component and Async Alpine will do the rest!

```html
<div
  ax-load="visible"
  ax-load-src="/assets/path-to-component.js"
  x-data="myComponent"
>
  <div x-text="message"></div>
</div>
```

***

## Strategies

### `eager`

The default strategy if not specified, if the component is present on the page loading will be kicked off immediately. It will still load asyncronously in the background but with the highest priority possible. This will behave similar to default Alpine behaviour and will ensure the component is interactive as soon as possible.

Best used to reduce the impact of loading large components that aren't present on the page, whilst still loading them as fast as possible when they are present. If your component isn't within the first view or is not extremely high priority consider using [idle](#idle) or [visible](#visible).

Usage examples:

```html
<div
  ax-load
  ax-load-src="/assets/path-to-component.js"
  x-data="componentName"
></div>

<div
  ax-load="eager"
  ax-load-src="/assets/path-to-component.js"
  x-data="componentName"
></div>
```

### `idle`

Uses `requestIdleCallback` where it's supported to load when the main thread is less busy. Where `requestIdleCallback` isn't supported we use an arbitrary `200ms` delay.

Best used for components that aren't critical to the initial paint/load. Waiting until the main thread is less busy will allow more important work&mdash;including `eager` components, other JS and image/font loading&mdash;to have priority.

Usage example:

```html
<div
  ax-load="idle"
  ax-load-src="/assets/path-to-component.js"
  x-data="componentName"
></div>
```

### `visible`

Uses `IntersectionObserver` to only load when the component is in view, similar to lazy-loading images.

If you want to start downloading the component when the browser *approaches* the component you can specify `rootMargin` in brackets as in the below example. Read more about [IntersectionObserver and rootMargin on MDN](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/IntersectionObserver).

Best used for components that aren't 'above the fold' or in view on the first load to only load them if and when they're needed.

Usage examples:

```html
<div
  ax-load="visible"
  ax-load-src="/assets/path-to-component.js"
  x-data="componentName"
></div>

<!-- using custom `rootMargin` -->
<div
  ax-load="visible (100px 100px 100px 100px)"
  ax-load-src="/assets/path-to-component.js"
  x-data="componentName"
></div>
```

### `media`

Will load the component when the provided media query is `true`.

Provide your media query in brackets as in the below examples. The relies on `window.matchMedia`, which supports all media queries you might use in CSS.

Best used for when components are only interactive based on certain conditions. The most common use-case is based on screen size, but all CSS queries are available including prefers-reduced-motion, orientation and more.

Usage examples:

```html
<div
  ax-load="media (max-width: 820px)"
  ax-load-src="/assets/path-to-component.js"
  x-data="componentName"
></div>

<div
  ax-load="media (prefers-reduced-motion: no-preference)"
  ax-load-src="/assets/path-to-component.js"
  x-data="componentName"
></div>
```

### `event`

The component won't be loaded until it receives the `async-alpine:load` event on `window`. Provide the `id` of the component in `detail.id`.

This can be used for many different cases, the most simple would be loading a component on the click of a button. As it's flexible however you can implement your own conditions and trigger to load the component if you wanted.

Best used for when the other strategies (or a combination) don't quite load components when you need them.

Usage examples:

```html
<!-- on a button click using Alpine's $dispatch -->
<button x-data @click="$dispatch('async-alpine:load', { id: 'my-component-1' })">Load component</button>
<div
  id="my-component-1"
  ax-load="event"
  ax-load-src="/assets/path-to-component.js"
  x-data="componentName"
></div>

<!-- load our component after `another-library-init` has loaded -->
<script>
window.addEventListener('another-library-init', () => {
  window.dispatchEvent(new CustomEvent('async-alpine:load', {
    detail: {
      id: 'my-component-2'
    }
  }))
})
</script>
<div
  id="my-component-2"
  ax-load="media (prefers-reduced-motion: no-preference)"
  ax-load-src="/assets/path-to-component.js"
  x-data="componentName"
></div>
```

### Combine strategies

Strategies can also be combined by separating with pipe `|`, allowing for advanced and complex code splitting:

```html
<div
  ax-load="idle | visible | media (min-width: 1024px)"
  ax-load-src="/assets/path-to-component.js"
  x-data="componentName"
></div>
```

***

## Limitations and Todo

- Limitation: nesting `lx-load` does not guarantee the order in which components load. This will likely make nested components that rely on each other inconsistent.
- Todo: Support `data-x-` attributes and [custom prefixes](https://github.com/alpinejs/alpine/discussions/2042#discussioncomment-1304957)

## License and Credits

This project is licensed under the Apache-2.0 license.

The full license is included at [LICENSE.md](/accudio/async-alpine/blob/main/LICENSE.md), or at [apache.org/licenses/LICENSE-2.0](https://apache.org/licenses/LICENSE-2.0).

Copyright © 2022 [Alistair Shepherd](https://alistairshepherd.uk).
