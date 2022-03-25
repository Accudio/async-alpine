/* global Alpine */

import { AsyncAlpine } from './core/async-alpine.js';

document.addEventListener('alpine:init', () => {
  AsyncAlpine(Alpine);
});
