// src/core/config/index.js
var config = {
  prefix: "ax-",
  root: "ax-load",
  src: "ax-load-src",
  id: "ax-id",
  defaultStrategy: "immediate",
  alpine: {
    prefix: "x-",
    data: "x-data",
    cloak: "x-cloak"
  }
};
var config_default = config;

// src/core/attributes.js
var getAlpineAttrs = (el) => {
  return [...el.attributes].map((el2) => el2.name).filter((attr) => attr.startsWith(config_default.alpine.prefix)).filter((attr) => attr !== config_default.alpine.cloak);
};
var disableAttributes = (el) => {
  for (let attribute of el.attributes) {
    el.node.setAttribute(config_default.prefix + attribute, el.node.getAttribute(attribute));
    el.node.removeAttribute(attribute);
  }
};
var enableAttributes = (el) => {
  for (let attribute of el.attributes) {
    el.node.setAttribute(attribute, el.node.getAttribute(config_default.prefix + attribute));
    el.node.removeAttribute(config_default.prefix + attribute);
  }
};

// src/core/component.js
var Component = class {
  constructor(root, index) {
    this.status = "unloaded";
    this.src = root.getAttribute(config_default.src);
    this.strategy = root.getAttribute(config_default.root) || config_default.defaultStrategy;
    this.name = root.getAttribute(config_default.alpine.data).split("(")[0];
    this.id = root.id || config_default.prefix + index;
    this.root = {
      node: root,
      attributes: getAlpineAttrs(root)
    };
    root.setAttribute(config_default.id, this.id);
    this.children = [...root.querySelectorAll("*")].filter((el) => getAlpineAttrs(el).length).filter((el) => !el.hasAttribute(config_default.root)).filter((el) => el.closest(`[${config_default.root}]`) === root).map((node) => ({
      node,
      attributes: getAlpineAttrs(node)
    }));
  }
  deactivate() {
    disableAttributes(this.root);
    for (let child of this.children) {
      disableAttributes(child);
    }
  }
  async download(Alpine) {
    this.status = "loading";
    const module = await import(
      /* webpackIgnore: true */
      this.src
    );
    let whichExport = module[this.name] || module.default || Object.values(module)[0] || false;
    if (!whichExport)
      return;
    Alpine.data(this.name, whichExport);
    this.activate();
  }
  activate() {
    enableAttributes(this.root);
    for (let child of this.children) {
      enableAttributes(child);
    }
    this.root.node.removeAttribute(config_default.alpine.cloak);
    for (let child of this.children) {
      child.node.removeAttribute(config_default.alpine.cloak);
    }
    this.status = "loaded";
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

// src/core/async-alpine.js
var idIndex = 1;
var AsyncAlpine = (Alpine) => {
  const roots = document.querySelectorAll(`[${config_default.root}]`);
  if (!roots)
    return;
  for (let root of roots) {
    const component = new Component(root, idIndex++);
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
    }
    Promise.all(promises).then(() => {
      component.download(Alpine);
    });
  }
};
export {
  AsyncAlpine as default
};
