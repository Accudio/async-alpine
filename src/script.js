/* global Alpine */

import { AsyncAlpine } from './core/async-alpine.js';

document.addEventListener('alpine:init', () => {
  window.AsyncAlpine = AsyncAlpine;
  AsyncAlpine.init(
    Alpine,
    window.AsyncAlpineOptions || {}
  );
  document.dispatchEvent(new CustomEvent('async-alpine:init'));
  AsyncAlpine.start();
});
