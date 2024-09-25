/* global Alpine */

import AsyncAlpine from './async-alpine.js'

document.addEventListener('alpine:init', () => {
	Alpine.plugin(AsyncAlpine)
	document.dispatchEvent(new CustomEvent('async-alpine:init'))
})
