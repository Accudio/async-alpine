var __defProp = Object.defineProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __export = (target, all) => {
  __markAsModule(target);
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/core/strategies/index.js
var strategies_exports = {};
__export(strategies_exports, {
  eager: () => eager_default,
  event: () => event_default,
  idle: () => idle_default,
  media: () => media_default,
  visible: () => visible_default
});

// src/core/strategies/eager.js
var eager = () => {
  return true;
};
var eager_default = eager;

// src/core/strategies/event.js
var event = ({ component, argument }) => {
  return new Promise((resolve) => {
    if (argument) {
      window.addEventListener(argument, () => resolve(), { once: true });
    } else {
      const cb = (e) => {
        if (e.detail.id !== component.id)
          return;
        window.removeEventListener("async-alpine:load", cb);
        resolve();
      };
      window.addEventListener("async-alpine:load", cb);
    }
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
var media = ({ argument }) => {
  return new Promise((resolve) => {
    if (!argument) {
      console.log("Async Alpine: media strategy requires a media query. Treating as 'eager'");
      return resolve();
    }
    const mediaQuery = window.matchMedia(`(${argument})`);
    if (mediaQuery.matches) {
      resolve();
    } else {
      mediaQuery.addEventListener("change", resolve, { once: true });
    }
  });
};
var media_default = media;

// src/core/strategies/visible.js
var visible = ({ component, argument }) => {
  return new Promise((resolve) => {
    const rootMargin = argument || "0px 0px 0px 0px";
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        observer.disconnect();
        resolve();
      }
    }, { rootMargin });
    observer.observe(component.el);
  });
};
var visible_default = visible;

// src/core/requirement-parser.js
function parseRequirements(expression) {
  const tokens = tokenize(expression);
  let ast = parseExpression(tokens);
  if (ast.type === "method") {
    return {
      type: "expression",
      operator: "&&",
      parameters: [ast]
    };
  }
  return ast;
}
function tokenize(expression) {
  const regex = /\s*([()])\s*|\s*(\|\||&&|\|)\s*|\s*((?:[^()&|]+\([^()]+\))|[^()&|]+)\s*/g;
  const tokens = [];
  let match;
  while ((match = regex.exec(expression)) !== null) {
    const [, parenthesis, operator, token] = match;
    if (parenthesis !== void 0) {
      tokens.push({ type: "parenthesis", value: parenthesis });
    } else if (operator !== void 0) {
      tokens.push({
        type: "operator",
        value: operator === "|" ? "&&" : operator
      });
    } else {
      const tokenObj = {
        type: "method",
        method: token.trim()
      };
      if (token.includes("(")) {
        tokenObj.method = token.substring(0, token.indexOf("(")).trim();
        tokenObj.argument = token.substring(token.indexOf("(") + 1, token.indexOf(")"));
      }
      if (token.method === "immediate") {
        token.method = "eager";
      }
      tokens.push(tokenObj);
    }
  }
  return tokens;
}
function parseExpression(tokens) {
  let ast = parseTerm(tokens);
  while (tokens.length > 0 && (tokens[0].value === "&&" || tokens[0].value === "|" || tokens[0].value === "||")) {
    const operator = tokens.shift().value;
    const right = parseTerm(tokens);
    if (ast.type === "expression" && ast.operator === operator) {
      ast.parameters.push(right);
    } else {
      ast = {
        type: "expression",
        operator,
        parameters: [ast, right]
      };
    }
  }
  return ast;
}
function parseTerm(tokens) {
  if (tokens[0].value === "(") {
    tokens.shift();
    const ast = parseExpression(tokens);
    if (tokens[0].value === ")") {
      tokens.shift();
    }
    return ast;
  } else {
    return tokens.shift();
  }
}

// src/core/async-alpine.js
var internalNamePrefix = "__internal_";
var AsyncAlpine = {
  Alpine: null,
  _options: {
    prefix: "ax-",
    alpinePrefix: "x-",
    root: "load",
    inline: "load-src",
    defaultStrategy: "eager"
  },
  _alias: false,
  _data: {},
  _realIndex: 0,
  get _index() {
    return this._realIndex++;
  },
  init(Alpine, opts = {}) {
    this.Alpine = Alpine;
    this._options = {
      ...this._options,
      ...opts
    };
    return this;
  },
  start() {
    this._processInline();
    this._setupComponents();
    this._mutations();
    return this;
  },
  data(name, download = false) {
    this._data[name] = {
      loaded: false,
      download
    };
    return this;
  },
  url(name, url) {
    if (!name || !url)
      return;
    if (!this._data[name])
      this.data(name);
    this._data[name].download = () => import(
      /* @vite-ignore */
      /* webpackIgnore: true */
      this._parseUrl(url)
    );
  },
  alias(path) {
    this._alias = path;
  },
  _processInline() {
    const inlineComponents = document.querySelectorAll(`[${this._options.prefix}${this._options.inline}]`);
    for (const component of inlineComponents) {
      this._inlineElement(component);
    }
  },
  _inlineElement(component) {
    const xData = component.getAttribute(`${this._options.alpinePrefix}data`);
    let srcUrl = component.getAttribute(`${this._options.prefix}${this._options.inline}`);
    if (!xData || !srcUrl)
      return;
    const name = this._parseName(xData);
    this.url(name, srcUrl);
  },
  _setupComponents() {
    const components = document.querySelectorAll(`[${this._options.prefix}${this._options.root}]`);
    for (let component of components) {
      this._setupComponent(component);
    }
  },
  _setupComponent(component) {
    const xData = component.getAttribute(`${this._options.alpinePrefix}data`);
    component.setAttribute(`${this._options.alpinePrefix}ignore`, "");
    const name = this._parseName(xData);
    const strategy = component.getAttribute(`${this._options.prefix}${this._options.root}`) || this._options.defaultStrategy;
    this._componentStrategy({
      name,
      strategy,
      el: component,
      id: component.id || this._index
    });
  },
  async _componentStrategy(component) {
    const requirements = parseRequirements(component.strategy);
    await this._generateRequirements(component, requirements);
    await this._download(component.name);
    this._activate(component);
  },
  _generateRequirements(component, obj) {
    if (obj.type === "expression") {
      if (obj.operator === "&&") {
        return Promise.all(obj.parameters.map((param) => this._generateRequirements(component, param)));
      }
      if (obj.operator === "||") {
        return Promise.any(obj.parameters.map((param) => this._generateRequirements(component, param)));
      }
    }
    if (!strategies_exports[obj.method])
      return false;
    return strategies_exports[obj.method]({
      component,
      argument: obj.argument
    });
  },
  async _download(name) {
    if (name.startsWith(internalNamePrefix))
      return;
    this._handleAlias(name);
    if (!this._data[name] || this._data[name].loaded)
      return;
    const module = await this._getModule(name);
    this.Alpine.data(name, module);
    this._data[name].loaded = true;
  },
  async _getModule(name) {
    if (!this._data[name])
      return;
    const module = await this._data[name].download();
    if (typeof module === "function")
      return module;
    let whichExport = module[name] || module.default || Object.values(module)[0] || false;
    return whichExport;
  },
  _activate(component) {
    component.el.removeAttribute(`${this._options.alpinePrefix}ignore`);
    component.el._x_ignore = false;
    this.Alpine.initTree(component.el);
  },
  _mutations() {
    const observer = new MutationObserver((entries) => {
      for (const entry of entries) {
        if (!entry.addedNodes)
          continue;
        for (const node of entry.addedNodes) {
          if (node.nodeType !== 1)
            continue;
          if (node.hasAttribute(`${this._options.prefix}${this._options.root}`)) {
            this._mutationEl(node);
          }
          const childComponents = node.querySelectorAll(`[${this._options.prefix}${this._options.root}]`);
          childComponents.forEach((el) => this._mutationEl(el));
        }
      }
    });
    observer.observe(document, {
      attributes: true,
      childList: true,
      subtree: true
    });
  },
  _mutationEl(el) {
    if (el.hasAttribute(`${this._options.prefix}${this._options.inline}`)) {
      this._inlineElement(el);
    }
    this._setupComponent(el);
  },
  _handleAlias(name) {
    if (!this._alias || this._data[name])
      return;
    this.url(name, this._alias.replace("[name]", name));
  },
  _parseName(attribute) {
    const parsedName = (attribute || "").split(/[({]/g)[0];
    const ourName = parsedName || `${internalNamePrefix}${this._index}`;
    return ourName;
  },
  _parseUrl(url) {
    const absoluteReg = new RegExp("^(?:[a-z+]+:)?//", "i");
    if (!absoluteReg.test(url)) {
      return new URL(url, document.baseURI).href;
    }
    return url;
  }
};
export {
  AsyncAlpine as default
};
