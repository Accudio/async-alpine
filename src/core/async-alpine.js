import * as strategies from './strategies/index.js';

const internalNamePrefix = '__internal_';

const AsyncAlpine = {
  Alpine: null,

  // custom options, over-ridden by the second param of init
  _options: {
    prefix: 'ax-',
    alpinePrefix: 'x-',
    root: 'load',
    inline: 'load-src',
    defaultStrategy: 'immediate',
  },

  // if we fall back to an alias when components aren't pre-registered
  _alias: false,

  // data cache
  _data: {},

  // index for ID generation
  _realIndex: 0,
  get _index() {
    return this._realIndex++;
  },

  /**
   * =================================
   * lifecycle
   * =================================
   */
  // initialise Alpine and options
  init(Alpine, opts = {}) {
    this.Alpine = Alpine;
    this._options = {
      ...this._options,
      ...opts,
    };
    return this;
  },

  // actually run stuff
  start() {
    this._processInline();
    this._setupComponents();
    this._mutations();
    return this;
  },

  /**
   * =================================
   * component registration
   * =================================
   */
  // register a component internally
  data(name, download = false) {
    this._data[name] = {
      loaded: false,
      download,
    };
    return this;
  },

  // shorthand to register a component with a URL in JS
  url(name, url) {
    if (!name || !url) return;
    if (!this._data[name]) this.data(name);
    this._data[name].download = () => import(
      /* @vite-ignore */
      /* webpackIgnore: true */
      url
    );
  },

  // fall back to requesting an unknown URL if a component isn't registered
  alias(path) {
    this._alias = path;
  },

  /**
   * =================================
   * process inline components
   * =================================
   */
  // loop through all elements with ax-load-src to process them
  _processInline() {
    const inlineComponents = document.querySelectorAll(`[${this._options.prefix}${this._options.inline}]`);
    for (const component of inlineComponents) {
      this._inlineElement(component);
    }
  },

  // process element to add the download function for this component
  _inlineElement(component) {
    const xData = component.getAttribute(`${this._options.alpinePrefix}data`);
    let srcUrl = component.getAttribute(`${this._options.prefix}${this._options.inline}`);
    if (!xData || !srcUrl) return;

    // if the URL is relative then convert it to absolute based on the document baseURI
    // this is needed for when async alpine is loaded from a different origin than the page and component
    const absoluteReg = new RegExp('^(?:[a-z+]+:)?//', 'i');
    if (!absoluteReg.test(srcUrl)) {
      srcUrl = new URL(srcUrl, document.baseURI).href;
    }

    const name = this._parseName(xData);
    this.url(name, srcUrl);
  },

  /**
   * =================================
   * set up components
   * =================================
   */
  // loop through elements with ax-load and set them up as components
  _setupComponents() {
    const components = document.querySelectorAll(`[${this._options.prefix}${this._options.root}]`);
    for (let component of components) {
      this._setupComponent(component);
    }
  },

  // set this element up as a component
  _setupComponent(component) {
    const xData = component.getAttribute(`${this._options.alpinePrefix}data`);
    component.setAttribute(`${this._options.alpinePrefix}ignore`, '');

    const name = this._parseName(xData);
    const strategy = component.getAttribute(`${this._options.prefix}${this._options.root}`) || this._options.defaultStrategy;

    this._componentStrategy({
      name,
      strategy,
      el: component,
      id: component.id || this._index,
    });
  },

  /**
   * =================================
   * component strategies
   * =================================
   * split strategy into unique requirements and download the
   * component when requirements have been met
   */
  async _componentStrategy(component) {
    // split strategy into parts
    const requirements = component.strategy
      .split('|')
      .map(requirement => requirement.trim())
      .filter(requirement => requirement !== 'immediate')
      .filter(requirement => requirement !== 'eager');

    // if no requirements then load immediately
    if (!requirements.length) {
      await this._download(component.name);
      this._activate(component);
      return;
    }

    // set up promises for loading
    let promises = [];
    for (let requirement of requirements) {
      // idle using requestIdleCallback
      if (requirement === 'idle') {
        promises.push(strategies.idle());
        continue;
      }

      // visible using intersectionObserver
      if (requirement.startsWith('visible')) {
        promises.push(strategies.visible(component, requirement));
        continue;
      }

      // media query
      if (requirement.startsWith('media')) {
        promises.push(strategies.media(requirement));
        continue;
      }

      // event
      if (requirement === 'event') {
        promises.push(strategies.event(component));
      }
    }

    // wait for all promises (requirements) to resolve and then download component
    Promise.all(promises)
      .then(async () => {
        await this._download(component.name);
        this._activate(component);
      });
  },

  /**
   * =================================
   * component download
   * =================================
   */
  // check if the component has been downloaded, if not trigger download and register with Alpine
  async _download(name) {
    if (name.startsWith(internalNamePrefix)) return;
    this._handleAlias(name);
    if (!this._data[name] || this._data[name].loaded) return;
    const module = await this._getModule(name);
    this.Alpine.data(name, module);
    this._data[name].loaded = true;
  },

  // run the callback function to get the module and find the appropriate import
  async _getModule(name) {
    if (!this._data[name]) return;

    const module = await this._data[name].download();

    // if the download function returns a function instead return that
    if (typeof module === 'function') return module;

    // work out which export to use in order of preference:
    // name; default; first export
    let whichExport = module[name] || module.default || Object.values(module)[0] || false;
    return whichExport;
  },

  /**
   * =================================
   * component activation
   * =================================
   * remove x-ignore attribute and the _x_ignore data property
   * them force Alpine to re-scan the tree
   */
  _activate(component) {
    component.el.removeAttribute(`${this._options.alpinePrefix}ignore`);
    // eslint-disable-next-line camelcase
    component.el._x_ignore = false;
    this.Alpine.initTree(component.el);
  },

  /**
   * =================================
   * mutation observer
   * =================================
   * watch for DOM mutations and set up added elements as new components
   */
  _mutations() {
    const observer = new MutationObserver(entries => {
      for (const entry of entries) {
        if (!entry.addedNodes) continue;
        for (const node of entry.addedNodes) {
          // only process element nodes
          if (node.nodeType !== 1) continue;

          // if the directly added node has ax-load then set it up
          if (node.hasAttribute(`${this._options.prefix}${this._options.root}`)) {
            this._mutationEl(node);
          }

          // check all descendants for ax-load
          const childComponents = node.querySelectorAll(`[${this._options.prefix}${this._options.root}]`);
          childComponents.forEach(el => this._mutationEl(el));
        }
      }
    });
    observer.observe(document, {
      attributes: true,
      childList: true,
      subtree: true,
    });
  },

  _mutationEl(el) {
    // if inline has been triggered and this element has inline src
    if (el.hasAttribute(`${this._options.prefix}${this._options.inline}`)) {
      this._inlineElement(el);
    }

    // setup component
    this._setupComponent(el);
  },

  /**
   * =================================
   * alias
   * =================================
   * if a component isn't specified allow for falling back to a url.
   * url should be provided as `/components/[name].js`
   */
  _handleAlias(name) {
    if (!this._alias || this._data[name]) return;
    // at this point alias is enabled and the component doesn't exist
    this.url(
      name,
      this._alias.replace('[name]', name)
    );
  },

  /**
   * =================================
   * helpers
   * =================================
   */
  // take x-data content to parse out name 'output("test")' becomes 'output'
  _parseName(attribute) {
    const parsedName = (attribute || '').split(/[({]/g)[0];
    const ourName = parsedName || `${internalNamePrefix}${this._index}`;
    return ourName;
  },
};

export { AsyncAlpine };
