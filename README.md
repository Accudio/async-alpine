# Async Alpine

Load Alpine Components asynchronously—allows for code splitting and lazy loading components!

Allows you to load Alpine.js components using JavaScript files based on a variety of strategies including: presence on the page; on idle; media queries; when visible; and events. You can even combine strategies for advanced loading behaviour!

***This is still experimental, subject to change and should be used on production sites with caution!***

## Table of Contents

- [Installation](#installation)
   - [CDN](#cdn-easy)
   - [npm](#npm)
- [Usage](#usage)
   - [Inline Components](#inline-components)
   - [Data Components](#data-components)
   - [URL Components](#url-components)
   - [Alias Loading](#alias-loading)
- [Strategies](#strategies)
   - [eager](#eager)
   - [idle](#idle)
   - [visible](#visible)
   - [media](#media)
   - [event](#event)
   - [Combine strategies](#combine-strategies)
- [Advanced Options](#advanced-options)
- [Limitations and gotchas](#limitations-and-gotchas)
- [License and Credits](#license-and-credits)

***

## Installation

There are two recommended methods of loading Async Alpine. Adding a `script` tag with a [CDN](#cdn) or importing it into your bundle with [npm](#npm).

Which method you use will depend on how you prefer to use and import Alpine.js.

### CDN (easy)

If you load Alpine from a CDN like [jsdelivr](https://www.jsdelivr.com/package/npm/async-alpine) with a script tag you can load Async Alpine via the same method:
```html
<script src="https://cdn.jsdelivr.net/npm/async-alpine@0.4.x/dist/async-alpine.script.js"></script>
<script src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
```

When loading via this method you need to make sure that Async Alpine loads first. This is generally done by including the `script` tag for Async Alpine *before* Alpine. Watch out if you use `type="module"` or `async` on your script tags.

### npm

Install from [npm](https://www.npmjs.com/package/async-alpine) with:
```
npm install async-alpine
```

Import it into your bundle alongside Alpine and run `AsyncAlpine.init(Alpine)` and `AsyncAlpine.start()` it before `Alpine.start()`:
```js
import AsyncAlpine from 'async-alpine';
import Alpine from 'alpinejs';

AsyncAlpine.init(Alpine);
AsyncAlpine.start();

Alpine.start();
```

***

## Usage

Alpine components are turned into async components by adding the attributes `x-ignore` and `ax-load`—with optional [loading strategy](#strategies):

```html
<div
  x-ignore
  ax-load="visible"
  x-data="myComponent"
>
  <div x-text="message"></div>
</div>
```

First however you need to convert your existing `Alpine.data()` components to standalone JavaScript files that can be loaded on-demand. There's a couple of different methods to do this, and the best will depend on how you write your JavaScript, if you have a build tool and how assets on your website are distributed.

As a general rule, if you have a build tool with dynamic `import`/code-splitting support and a standard asset loading system go for [Data Components](#data-components). Otherwise, use [Inline Components](#inline-components). We are putting together a guide on how to integrate with various build tools and platforms, if you aren't sure or are having issues [file an issue](https://github.com/Accudio/async-alpine/issues/new).

### Inline Components

Inline components are ideal for hand-written JS or if you have an unusual way of distributing JavaScript files (like using an asset CDN).

You provide components in an ES Module format—as `export default`—in a place that is publicly accessible. If you hand-code your component JavaScript this may be easy, but if you use a build tool you may need to set up your build tool in a certain way. An example of a ES Module component:

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

Once you have your component in a public location, add the `ax-load-src` attribute to your component HTML, with the full URL to the component JS:

```html
<div
  x-ignore
  ax-load="visible"
  ax-load-src="/assets/path-to-component.js"
  x-data="myComponent"
>
  <div x-text="message"></div>
</div>
```

Now the URL you provide will be downloaded and added as a component when the conditions of `ax-load` are met!

### Data Components

Data components offer more flexibility, particularly to users of build tools like Vite, WebPack and more. They allow you to declare a download function that runs when the requirements of the component are met. With this you can do whatever you like, as long as you return either a function or an ES Module with `default` export.

You declare a data component using the `AsyncAlpine.data()` function, where the first parameter matches the component name (used in `x-data`) and the second is your download function. This is likely most commonly used to use your build tools code-splitting:

```js
import AsyncAlpine from 'async-alpine';
import Alpine from 'Alpine.js';

AsyncAlpine
  .init(Alpine)
  .data('myComponent', () => import('./components/my-component.js'))
  .start();

Alpine.start();
```

With this pattern and a build tool that supports it this will automatically build your component into a separate file with the appropriate processing. Keep in mind however if how your distribute your assets changes how they're delivered this may not work and you may need to use Inline Components.

### URL Components

Very similar to [Inline Components](#inline-components) but specifying the URL in JavaScript rather than on the component. This may make it easier to manage components and allows specifying component URLs once instead of on every instance.

```js
import AsyncAlpine from 'async-alpine';
import Alpine from 'Alpine.js';

AsyncAlpine
  .init(Alpine)
  .url('myComponent', './components/my-component.js')
  .start();

Alpine.start();
```

### Alias Loading

If all of your component modules are in a consistent structure the Alias loading method means you don't have to specify the URLs for each component. Instead you can specify the structure of your component files and Async Alpine will construct the URL from the component name.

***Note:*** Async Alpine does not know whether your component files actually exist, it will simply make a blind HTTP request based on the provided URL format and hope it returns something it can execute. For this reason only one `.alias()` is supported.

```js
// components are in the /components/ directory named myComponent.js
AsyncAlpine.alias('/components/[name].js')

// components are in the separate directories as index.js
AsyncAlpine.alias('/components/[name]/index.js')
```

***

## Strategies

### `eager`

The default strategy if not specified, if the component is present on the page loading will be kicked off immediately. It will still load asynchronously in the background but with the highest priority possible. This will behave similar to default Alpine behaviour and will ensure the component is interactive as soon as possible.

Best used to reduce the impact of loading large components that aren't present on the page, whilst still loading them as fast as possible when they are present. If your component isn't within the first view or is not extremely high priority consider using [idle](#idle) or [visible](#visible).

Usage examples:

```html
<div
  x-ignore
  ax-load
  x-data="componentName"
></div>

<div
  x-ignore
  ax-load="eager"
  x-data="componentName"
></div>
```

### `idle`

Uses `requestIdleCallback` where it's supported to load when the main thread is less busy. Where [`requestIdleCallback` isn't supported](https://caniuse.com/requestidlecallback) (Safari currently) we use an arbitrary `200ms` delay to wait until the thread has hopefully cleared up.

Best used for components that aren't critical to the initial paint/load. Waiting until the main thread is less busy will allow more important work&mdash;including `eager` components, other JS and image/font loading&mdash;to have priority.

Usage example:

```html
<div
  x-ignore
  ax-load="idle"
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
  x-ignore
  ax-load="visible"
  x-data="componentName"
></div>

<!-- using custom `rootMargin` -->
<div
  x-ignore
  ax-load="visible (100px 100px 100px 100px)"
  x-data="componentName"
></div>
```

### `media`

Will load the component when the provided media query evalutes as true.

Provide your media query in brackets as in the below examples. The relies on `window.matchMedia`, which supports all media queries you might use in CSS.

Best used for when components are only interactive based on certain conditions. The most common use-case is based on screen size, but all CSS queries are available including prefers-reduced-motion, orientation and more.

Usage examples:

```html
<div
  x-ignore
  ax-load="media (max-width: 820px)"
  x-data="componentName"
></div>

<div
  x-ignore
  ax-load="media (prefers-reduced-motion: no-preference)"
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
  x-ignore
  ax-load="event"
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
  x-ignore
  ax-load="media (prefers-reduced-motion: no-preference)"
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

## Advanced Options

Advanced options are provided as an optional second parameter to `AsyncAlpine.init()` as an object. As an example here we set Alpine and Async Alpine to use prefixes starting with `data-` for HTML spec compliance:

```js
AsyncAlpine.init(Alpine, {
  prefix: 'data-ax-',
  alpinePrefix: 'data-x-'
})
Alpine.prefix('data-x-')
```

For a script installation, advanced options can be specified by setting `window.AsyncAlpineOptions` to the object as above.

### Available Options

| Option Name          | property          | Default | Notes |
| -------------------- | ----------------- | ------- | ----- |
| Custom Prefix        | `prefix`          | `ax-`   | Sets the prefix Async Alpine uses for attributes. Can be set to `data-ax-` to make markup HTML spec-compliant. Similar to `alpinePrefix` below. |
| Custom Alpine Prefix | `alpinePrefix`    | `x-`    | If you set a [custom prefixes](https://github.com/alpinejs/alpine/discussions/2042#discussioncomment-1304957) for Alpine.js, set this here also |
| Default Strategy     | `defaultStrategy` | `eager` | Allows changing the strategy used when the `ax-load` attribute is empty. |

***

## Limitations and gotchas

- Due to an Alpine limitation `x-ignore` should be added to ALL Async Alpine components. Some circumstances work without it but it will make it much harder to debug if those circumstances change.
- Alpine directives will be completely ignored within unloaded components.
- When nesting components, descendants won't be initialised until all ancestor async components have been loaded.

## License and Credits

This project is licensed under the Apache-2.0 license.

The full license is included at [LICENSE.md](/accudio/async-alpine/blob/main/LICENSE.md), or at [apache.org/licenses/LICENSE-2.0](https://apache.org/licenses/LICENSE-2.0).

Copyright © 2022 [Alistair Shepherd](https://alistairshepherd.uk).
