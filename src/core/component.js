import { getAlpineAttrs, enableAttributes, disableAttributes } from './attributes.js';

const Component = class {
  constructor(root, config, index) {
    this.config = config;
    this.status = 'unloaded';
    this.src = root.getAttribute(config.src);
    this.strategy = root.getAttribute(config.root) || config.defaultStrategy;
    this.name = root.getAttribute(`${config.alpine.prefix}data`).split('(')[0];
    this.id = root.id || (config.prefix + index);
    this.root = {
      node: root,
      attributes: getAlpineAttrs(root, this.config),
    };

    // set id attribute if not already
    root.setAttribute(config.id, this.id);

    // get children of this component
    this.children = [ ...root.querySelectorAll('*') ]
      // filter out only elements with alpine attributes
      .filter(el => getAlpineAttrs(el, this.config).length)
      // remove any items with `config.root` since they'll manage themselves
      .filter(el => !el.hasAttribute(config.root))
      // only get elements directly controlled by this component
      .filter(el => el.closest(`[${config.root}]`) === root)
      // restructure to include attribute names too
      .map(node => ({
        node,
        attributes: getAlpineAttrs(node, this.config),
      }));
  }

  // disable component being handled by Alpine
  deactivate() {
    disableAttributes(this.root, this.config);
    for (let child of this.children) {
      disableAttributes(child, this.config);
    }
  }

  // download and register the component module
  async download(Alpine) {
    this.status = 'loading';

    const module = await import(
      /* webpackIgnore: true */
      this.src
    );

    // work out which export to use in order of preference:
    // name; default; first export
    let whichExport = module[this.name] || module.default || Object.values(module)[0] || false;
    if (!whichExport) return;

    // register component with Alpine
    Alpine.data(this.name, whichExport);

    // activate component
    this.activate();
  }

  // activate component being handled by Alpine, remove x-cloak attributes and update status
  activate() {
    // update attributes
    enableAttributes(this.root, this.config);
    for (let child of this.children) {
      enableAttributes(child, this.config);
    }

    // remove cloak
    this.root.node.removeAttribute(`${this.config.prefix}cloak`);
    for (let child of this.children) {
      child.node.removeAttribute(`${this.config.prefix}cloak`);
    }

    // update status
    this.status = 'loaded';
  }
};

export { Component };
