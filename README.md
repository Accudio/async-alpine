# Async Alpine

Load Alpine Componenets asyncronously. Allows for code splitting and lazy loading components!

***This is still very experimental and is not ready for production use!***

***

## Installation

TODO: Installation with CDN and npm

```js
import Alpine from 'Alpine.js';
import AsyncAlpine from './async-alpine.js'

AsyncAlpine(Alpine)

Alpine.start()
```

## Usage

TODO: Improve usage instructions and examples

- Add `ax-load` attribute to Alpine component. Optionally specify your loading strategy here
- Set `ax-load-src` as a URL to your component as an ES Module
- Use Alpine normally within that component

```html
<div
  ax-load="visible"
  ax-load-src="/assets/path-to-component.js"
  x-data="componentName"
>
  <div x-text="message"></div>
</div>
```

## Strategies

- `eager` &mdash; default, will kick off loading in the background immediately
- `idle` &mdash; uses `requestIdleCallback` to load when the main thread is less busy
- `visible` &mdash; uses `IntersectionObserver` to only load when in view. You can also specify `rootMargin` by providing it in brackets: `visible (100px 100px 100px 100px)`
- `media` &mdash; will load when the provided media query is true. Media query provided in brackets: `media (max-width: 500px)`
- `event` &mdash; will listen for the `alpine-async:load` event on `window`. Provide the `id` of the component in `detail.id`

Strategies can also be combined by separating with pipe `|`, allowing for advanced and complex code splitting:
```html
<div
  ax-load="idle | visible | media (min-width: 1024px)"
  ax-load-src="/assets/path-to-component.js"
  x-data="componentName"
></div>
```

## Limitations and Todo

- Limitation: nesting `lx-load` does not guarantee the order in which components load. This will likely make nested components that rely on each other inconsistent.
- Todo: Support `data-x-` attributes and [custom prefixes](https://github.com/alpinejs/alpine/discussions/2042#discussioncomment-1304957)


## License and Credits

This project is licensed under the Apache-2.0 license.

The full license is included at [LICENSE.md](/accudio/async-alpine/blob/main/LICENSE.md), or at [apache.org/licenses/LICENSE-2.0](https://apache.org/licenses/LICENSE-2.0).

Copyright © 2022 [Alistair Shepherd](https://alistairshepherd.uk).
