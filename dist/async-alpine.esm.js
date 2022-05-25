// src/core/attributes.js
var getAlpineAttrs = (el, config2) => {
  return [...el.attributes].map((el2) => el2.name).filter((attr) => {
    for (let prefix of config2.alpine.attributes) {
      if (attr.startsWith(prefix))
        return true;
    }
    return false;
  }).filter((attr) => attr !== `${config2.alpine.prefix}cloak`);
};
var disableAttributes = (el, config2) => {
  for (let attribute of el.attributes) {
    el.node.setAttribute(config2.prefix + sanitiseAttribute(attribute), el.node.getAttribute(attribute));
    el.node.removeAttribute(attribute);
  }
};
var enableAttributes = (el, config2) => {
  for (let attribute of el.attributes) {
    const sanitisedAttr = sanitiseAttribute(attribute);
    el.node.setAttribute(sanitisedAttr, el.node.getAttribute(config2.prefix + sanitisedAttr));
    el.node.removeAttribute(config2.prefix + sanitisedAttr);
  }
};
var sanitiseAttribute = (attribute) => {
  if (attribute.startsWith("@")) {
    return "x-on:" + attribute.slice(1);
  }
  return attribute;
};

// src/core/component.js
var Component = class {
  constructor(root, instance, index) {
    this.instance = instance;
    this.status = "unloaded";
    this.src = root.getAttribute(this.instance.config.prefix + this.instance.config.src);
    this.strategy = root.getAttribute(this.instance.config.prefix + this.instance.config.root) || this.instance.config.defaultStrategy;
    this.name = root.getAttribute(`${this.instance.config.alpine.prefix}data`).split("(")[0];
    this.id = root.id || this.instance.config.prefix + index;
    this.root = {
      node: root,
      attributes: getAlpineAttrs(root, this.instance.config)
    };
    root.setAttribute(this.instance.config.prefix + this.instance.config.id, this.id);
    this.children = [...root.querySelectorAll("*")].filter((el) => getAlpineAttrs(el, this.instance.config).length).filter((el) => !el.hasAttribute(this.instance.config.prefix + this.instance.config.root)).filter((el) => el.closest(`[${this.instance.config.prefix}${this.instance.config.root}]`) === root).map((node) => ({
      node,
      attributes: getAlpineAttrs(node, this.instance.config)
    }));
    this.parents = [];
    let cursor = root;
    do {
      cursor = cursor.parentNode.closest(`[${this.instance.config.prefix}${this.instance.config.root}]`);
      if (!cursor)
        break;
      const parent2 = instance.components.find((component) => component.root.node === cursor);
      this.parents.push(parent2.id);
    } while (cursor);
  }
  deactivate() {
    disableAttributes(this.root, this.instance.config);
    for (let child of this.children) {
      disableAttributes(child, this.instance.config);
    }
  }
  async download(Alpine) {
    this.status = "loading";
    const module = await this.getModule();
    Alpine.data(this.name, module);
    this.activate();
  }
  async getModule() {
    if (this.instance.moduleCache[this.src]) {
      return this.instance.moduleCache[this.src];
    }
    const module = await import(
      /* webpackIgnore: true */
      this.src
    );
    let whichExport = module[this.name] || module.default || Object.values(module)[0] || false;
    this.instance.moduleCache[this.src] = whichExport;
    return whichExport;
  }
  activate() {
    enableAttributes(this.root, this.instance.config);
    for (let child of this.children) {
      enableAttributes(child, this.instance.config);
    }
    this.root.node.removeAttribute(`${this.instance.config.alpine.prefix}cloak`);
    for (let child of this.children) {
      child.node.removeAttribute(`${this.instance.config.alpine.prefix}cloak`);
    }
    this.status = "loaded";
    window.dispatchEvent(new CustomEvent("async-alpine:loaded", {
      detail: {
        id: this.id
      }
    }));
  }
};

// src/core/strategies/event.js
var event = (component) => {
  return new Promise((resolve) => {
    window.addEventListener("async-alpine:load", (e) => {
      if (e.detail.id !== component.id)
        return;
      if (component.status !== "unloaded")
        return;
      resolve();
    });
  });
};
var event_default = event;

// src/core/strategies/idle.js
var idle = () => {
  return new Promise((resolve) => {
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(resolve);
    } else {
      setTimeout(resolve, 200);
    }
  });
};
var idle_default = idle;

// src/core/strategies/media.js
var media = (component, requirement) => {
  return new Promise((resolve) => {
    const queryStart = requirement.indexOf("(");
    const query = requirement.slice(queryStart);
    const mediaQuery = window.matchMedia(query);
    if (mediaQuery.matches) {
      resolve();
    } else {
      mediaQuery.addEventListener("change", resolve, { once: true });
    }
  });
};
var media_default = media;

// src/core/strategies/parent.js
var parent = (component, parentId, parentStatus) => {
  return new Promise((resolve) => {
    if (parentStatus !== "unloaded") {
      return resolve();
    }
    window.addEventListener("async-alpine:loaded", (e) => {
      if (e.detail.id !== parentId)
        return;
      if (component.status !== "unloaded")
        return;
      resolve();
    });
  });
};
var parent_default = parent;

// src/core/strategies/visible.js
var visible = (component, requirement) => {
  return new Promise((resolve) => {
    let rootMargin = "0px 0px 0px 0px";
    if (requirement.indexOf("(") !== -1) {
      const rootMarginStart = requirement.indexOf("(") + 1;
      rootMargin = requirement.slice(rootMarginStart, -1);
    }
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        observer.disconnect();
        resolve();
      }
    }, { rootMargin });
    observer.observe(component.root.node);
  });
};
var visible_default = visible;

// src/core/config/index.js
var config = {
  prefix: "ax-",
  root: "load",
  src: "load-src",
  id: "id",
  defaultStrategy: "immediate",
  alpine: {
    prefix: "x-",
    attributes: ["x-", ":", "@"]
  }
};
var config_default = config;

// src/core/async-alpine.js
var idIndex = 1;
var AsyncAlpine = (Alpine, opts = {}) => {
  const instance = {
    config: config_default,
    components: [],
    moduleCache: {}
  };
  if (opts.prefix)
    instance.config.prefix = opts.prefix;
  if (opts.alpinePrefix) {
    instance.config.alpine.prefix = opts.alpinePrefix;
    instance.config.alpine.attributes.push(opts.alpinePrefix);
  }
  const roots = document.querySelectorAll(`[${config_default.prefix}${config_default.root}]`);
  if (!roots)
    return;
  for (let root of roots) {
    const component = new Component(root, instance, idIndex++);
    instance.components.push(component);
  }
  for (let component of instance.components) {
    component.deactivate();
    const requirements = component.strategy.split("|").map((requirement) => requirement.trim()).filter((requirement) => requirement !== "immediate").filter((requirement) => requirement !== "eager");
    if (!requirements.length) {
      component.download(Alpine);
      continue;
    }
    let promises = [];
    for (let requirement of requirements) {
      if (requirement === "idle") {
        promises.push(idle_default());
        continue;
      }
      if (requirement.startsWith("visible")) {
        promises.push(visible_default(component, requirement));
        continue;
      }
      if (requirement.startsWith("media")) {
        promises.push(media_default(component, requirement));
        continue;
      }
      if (requirement === "event") {
        promises.push(event_default(component));
      }
      if (requirement === "parent" || requirement === "parents") {
        for (let parentId of component.parents) {
          let parent2 = instance.components.find((component2) => component2.id === parentId);
          promises.push(parent_default(component, parent2.id, parent2.status));
        }
      }
    }
    Promise.all(promises).then(() => {
      component.download(Alpine);
    });
  }
};
export {
  AsyncAlpine as default
};
