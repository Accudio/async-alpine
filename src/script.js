/* global Alpine */

import { AsyncAlpine } from './core/async-alpine.js';

document.addEventListener('alpine:init', () => {
  window.AsyncAlpine = AsyncAlpine;
  AsyncAlpine.init(Alpine);
  document.dispatchEvent(new CustomEvent('async-alpine:init'));
  AsyncAlpine.start();
});
