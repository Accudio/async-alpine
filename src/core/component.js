import { getAlpineAttrs, enableAttributes, disableAttributes } from './attributes.js';

const Component = class {
  constructor(root, instance, index) {
    this.instance = instance;
    this.status = 'unloaded';
    this.src = root.getAttribute(this.instance.config.prefix + this.instance.config.src);
    this.strategy =
      root.getAttribute(this.instance.config.prefix + this.instance.config.root)
      || this.instance.config.defaultStrategy;
    this.name = root.getAttribute(`${this.instance.config.alpine.prefix}data`).split('(')[0];
    this.id = root.id || (this.instance.config.prefix + index);
    this.root = {
      node: root,
      attributes: getAlpineAttrs(root, this.instance.config),
    };

    // set id attribute if not already
    root.setAttribute(this.instance.config.id + this.instance.config.id, this.id);

    // get children of this component
    this.children = [ ...root.querySelectorAll('*') ]
      // filter out only elements with alpine attributes
      .filter(el => getAlpineAttrs(el, this.instance.config).length)
      // remove any items with `config.root` since they'll manage themselves
      .filter(el => !el.hasAttribute(this.instance.config.prefix + this.instance.config.root))
      // only get elements directly controlled by this component
      .filter(el => el.closest(`[${this.instance.config.prefix}${this.instance.config.root}]`) === root)
      // restructure to include attribute names too
      .map(node => ({
        node,
        attributes: getAlpineAttrs(node, this.instance.config),
      }));
  }

  // disable component being handled by Alpine
  deactivate() {
    disableAttributes(this.root, this.instance.config);
    for (let child of this.children) {
      disableAttributes(child, this.instance.config);
    }
  }

  // download and register the component module
  async download(Alpine) {
    this.status = 'loading';

    const module = await this.getModule();

    // register component with Alpine
    Alpine.data(this.name, module);

    // activate component
    this.activate();
  }

  async getModule() {
    // if this module has been downloaded before and cached, use that instead
    if (this.instance.cache[this.src]) {
      return this.instance.cache[this.src];
    }

    const module = await import(
      /* webpackIgnore: true */
      this.src
    );

    // work out which export to use in order of preference:
    // name; default; first export
    let whichExport = module[this.name] || module.default || Object.values(module)[0] || false;

    // cache component for subsequent loads
    this.instance.cache[this.src] = whichExport;

    return whichExport;
  }

  // activate component being handled by Alpine, remove x-cloak attributes and update status
  activate() {
    // update attributes
    enableAttributes(this.root, this.instance.config);
    for (let child of this.children) {
      enableAttributes(child, this.instance.config);
    }

    // remove cloak
    this.root.node.removeAttribute(`${this.instance.config.alpine.prefix}cloak`);
    for (let child of this.children) {
      child.node.removeAttribute(`${this.instance.config.alpine.prefix}cloak`);
    }

    // update status
    this.status = 'loaded';
  }
};

export { Component };
