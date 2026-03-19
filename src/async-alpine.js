import { awaitRequirements } from './requirements.js'

export default function (Alpine) {
	/**
	 * =================================
	 * Configuration
	 * =================================
	 */
	const directive = 'load'
	const srcAttr = Alpine.prefixed('load-src')
	const ignoreAttr = Alpine.prefixed('ignore')
	let options = {
		defaultStrategy: 'eager',
		keepRelativeURLs: false,
	}


	/**
	 * =================================
	 * global variables
	 * =================================
	 */
	// if we fall back to an alias when components aren't pre-registered
	let alias = false

	// data cache
	let data = {}

	// index for ID generation
	let realIndex = 0
	function index() {
		return realIndex++
	}

	/**
	 * =================================
	 * Globally accessible functions on Alpine object
	 * =================================
	 */
	// specify Async Alpine options. Currently just defaultStrategy
	Alpine.asyncOptions = (opts) => {
		options = {
			...options,
			...opts,
		}
	}

	// register a component by name and with a download function. Used internally and publicly
	Alpine.asyncData = (name, download = false) => {
		data[name] = {
			loaded: false,
			download,
			type: 'data',
		}
	}

	// register an async Alpine directive by name and with a download function
	Alpine.asyncDirective = (name, download = false) => {
		data[name] = {
			loaded: false,
			download,
			type: 'directive',
		}
	}

	// shorthand to specify a direct URL to a module within JS.
	Alpine.asyncUrl = (name, url, type = 'data') => {
		if (!name || !url || data[name]) return
		data[name] = {
			loaded: false,
			download: () => import(
				/* @vite-ignore */
				/* webpackIgnore: true */
				parseUrl(url)
			),
			type,
		}
	}
	// sets the path or function to fall back to if a component isn't specified
	Alpine.asyncAlias = (path) => {
		alias = path
	}

	/**
	 * =================================
	 * Handlers for Alpine directive, ignoring elements and setting up module requirements and downloads
	 * =================================
	 */
	// inline handler adds x-ignore immediately and synchronously
	const syncHandler = (el) => {
		Alpine.skipDuringClone(() => {
			if (el._x_async) return
			el._x_async = 'init'
			el._x_ignore = true
			el.setAttribute(ignoreAttr, '')
		})()
	}

	// the bulk of processing happens within Alpine's deferred handler
	const handler = async (el) => {
		Alpine.skipDuringClone(async () => {
			if (el._x_async !== 'init') return
			el._x_async = 'await'
			const { name, strategy, directives } = elementPrep(el)
			await awaitRequirements({
				name,
				strategy,
				el,
				id: el.id || index(),
			})
			if (!el.isConnected) return
			await download(name)
			await Promise.all(directives.map(download))
			if (!el.isConnected) return
			activate(el)
			el._x_async = 'loaded'
		})()
	}

	// register handler functions and directive
	handler.inline = syncHandler
	Alpine.directive(directive, handler).before('ignore')

	/**
	 * =================================
	 * component lifecycle
	 * =================================
	 */
	// get name and strategy from the element attributes and handle inline src
	function elementPrep(el) {
		const { name, type } = parseName(el)
		const directives = parseDirectiveNames(el, name)
		const strategy = el.getAttribute(Alpine.prefixed(directive)) || options.defaultStrategy

		// convert an inline src attribute into a url function
		const urlAttributeValue = el.getAttribute(srcAttr)
		if (urlAttributeValue) {
			Alpine.asyncUrl(name, urlAttributeValue, type)
		}

		return {
			name,
			strategy,
			directives,
		}
	}

	// check if the component has been downloaded, if not trigger download and register with Alpine
	async function download(name) {
		if (name.startsWith('_x_async_')) return
		handleAlias(name)

		if (!data[name] || data[name].loaded) return

		const module = await getModule(name)
		if (data[name].type === 'directive') {
			Alpine.directive(name, module)
		}
		else {
			Alpine.data(name, module)
		}
		data[name].loaded = true
	}

	// run the callback function to get the module and find the appropriate import
	async function getModule(name) {
		if (!data[name]) return

		const module = await data[name].download(name)

		// if the download function returns a function instead return that
		if (typeof module === 'function') return module

		// work out which export to use in order of preference:
		// name; default; first export
		let whichExport = module[name] || module.default || Object.values(module)[0] || false
		return whichExport
	}

	// remove ignore attribute and property, then force Alpine to re-scan the tree
	function activate(el) {
		Alpine.destroyTree(el)

		el._x_ignore = false
		el.removeAttribute(ignoreAttr)

		// check there are no x-ignore elements within this element's ancestors
		if (el.closest(`[${ignoreAttr}]`)) return

		Alpine.initTree(el)
	}

	// if a component isn't specified in data, allow to fall back to a url or function
	function handleAlias(name) {
		if (!alias || data[name]) return
		if (typeof alias === 'function') {
			Alpine.asyncData(name, alias)
			return
		}
		Alpine.asyncUrl(name, alias.replaceAll('[name]', name))
	}

	// take x-data content to parse out name. 'output("test")' becomes 'output'
	function parseName(el) {
		const dataName = (el.getAttribute(Alpine.prefixed('data')) || '').trim().split(/[({]/g)[0]
		if (dataName) {
			return {
				name: dataName,
				type: 'data',
			}
		}

		// if no x-data is set, allow x-load to target pre-registered async directives
		const prefix = Alpine.prefixed('')
		for (const { name: attributeName } of Array.from(el.attributes)) {
			if (!attributeName.startsWith(prefix)) continue
			const directiveName = attributeName.slice(prefix.length).split(/[.:]/g)[0]
			if (directiveName === 'data' || directiveName === directive || directiveName === 'ignore') continue
			if (data[directiveName]?.type === 'directive') {
				return {
					name: directiveName,
					type: 'directive',
				}
			}
		}

		// we need this to support enabling inline expressions without a download
		return {
			name: `_x_async_${index()}`,
			type: 'data',
		}
	}

	function parseDirectiveNames(el, excludedName = false) {
		const prefix = Alpine.prefixed('')
		const names = []
		for (const { name: attributeName } of Array.from(el.attributes)) {
			if (!attributeName.startsWith(prefix)) continue
			const directiveName = attributeName.slice(prefix.length).split(/[.:]/g)[0]
			if (directiveName === 'data' || directiveName === directive || directiveName === 'ignore') continue
			if (directiveName === excludedName) continue
			if (data[directiveName]?.type === 'directive') {
				names.push(directiveName)
			}
		}
		return names
	}

	// if the URL is relative then convert it to absolute based on the document baseURI
	// this is needed for when async alpine is loaded from a different origin than the page and component
	function parseUrl(url) {
		// if the user has opted in to relative URLs then don't prefix the document baseURI.
		if (options.keepRelativeURLs) return url
		const absoluteReg = new RegExp('^(?:[a-z+]+:)?//', 'i')
		if (!absoluteReg.test(url)) {
			return new URL(url, document.baseURI).href
		}
		return url
	}
}
