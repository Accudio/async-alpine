var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/async-alpine.js
var async_alpine_exports = {};
__export(async_alpine_exports, {
  default: () => async_alpine_default
});
module.exports = __toCommonJS(async_alpine_exports);

// src/strategies.js
function eager() {
  return true;
}
function event({ component, argument }) {
  return new Promise((resolve) => {
    if (argument) {
      window.addEventListener(
        argument,
        () => resolve(),
        { once: true }
      );
    } else {
      const cb = (e) => {
        if (e.detail.id !== component.id) return;
        window.removeEventListener("async-alpine:load", cb);
        resolve();
      };
      window.addEventListener("async-alpine:load", cb);
    }
  });
}
function idle() {
  return new Promise((resolve) => {
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(resolve);
    } else {
      setTimeout(resolve, 200);
    }
  });
}
function media({ argument }) {
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
}
function visible({ component, argument }) {
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
}
var strategies_default = {
  eager,
  event,
  idle,
  media,
  visible
};

// src/requirements.js
async function awaitRequirements(component) {
  const requirements = parseRequirements(component.strategy);
  await generateRequirements(component, requirements);
}
async function generateRequirements(component, requirements) {
  if (requirements.type === "expression") {
    if (requirements.operator === "&&") {
      return Promise.all(
        requirements.parameters.map((param) => generateRequirements(component, param))
      );
    }
    if (requirements.operator === "||") {
      return Promise.any(
        requirements.parameters.map((param) => generateRequirements(component, param))
      );
    }
  }
  if (!strategies_default[requirements.method]) return false;
  return strategies_default[requirements.method]({
    component,
    argument: requirements.argument
  });
}
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
    const [_, parenthesis, operator, token] = match;
    if (parenthesis !== void 0) {
      tokens.push({ type: "parenthesis", value: parenthesis });
    } else if (operator !== void 0) {
      tokens.push({
        type: "operator",
        // we do the below to make operators backwards-compatible with previous
        // versions of Async Alpine, where '|' is equivalent to &&
        value: operator === "|" ? "&&" : operator
      });
    } else {
      const tokenObj = {
        type: "method",
        method: token.trim()
      };
      if (token.includes("(")) {
        tokenObj.method = token.substring(0, token.indexOf("(")).trim();
        tokenObj.argument = token.substring(
          token.indexOf("(") + 1,
          token.indexOf(")")
        );
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

// src/async-alpine.js
function async_alpine_default(Alpine) {
  const directive = "load";
  const srcAttr = Alpine.prefixed("load-src");
  const ignoreAttr = Alpine.prefixed("ignore");
  let options = {
    defaultStrategy: "eager",
    keepRelativeURLs: false
  };
  let alias = false;
  let data = {};
  let realIndex = 0;
  function index() {
    return realIndex++;
  }
  Alpine.asyncOptions = (opts) => {
    options = {
      ...options,
      ...opts
    };
  };
  Alpine.asyncData = (name, download2 = false) => {
    data[name] = {
      loaded: false,
      download: download2
    };
  };
  Alpine.asyncUrl = (name, url) => {
    if (!name || !url || data[name]) return;
    data[name] = {
      loaded: false,
      download: () => Promise.resolve().then(() => (
        /* @vite-ignore */
        /* webpackIgnore: true */
        __toESM(require(parseUrl(url)))
      ))
    };
  };
  Alpine.asyncAlias = (path) => {
    alias = path;
  };
  const syncHandler = (el) => {
    if (el._x_async) return;
    el._x_async = "init";
    el._x_ignore = true;
    el.setAttribute(ignoreAttr, "");
  };
  const handler = async (el) => {
    if (el._x_async !== "init") return;
    el._x_async = "await";
    const { name, strategy } = elementPrep(el);
    await awaitRequirements({
      name,
      strategy,
      el,
      id: el.id || index()
    });
    await download(name);
    activate(el);
    el._x_async = "loaded";
  };
  handler.inline = syncHandler;
  Alpine.directive(directive, handler).before("ignore");
  function elementPrep(el) {
    const name = parseName(el.getAttribute(Alpine.prefixed("data")));
    const strategy = el.getAttribute(Alpine.prefixed(directive)) || options.defaultStrategy;
    const urlAttributeValue = el.getAttribute(srcAttr);
    if (urlAttributeValue) {
      Alpine.asyncUrl(name, urlAttributeValue);
    }
    return {
      name,
      strategy
    };
  }
  async function download(name) {
    if (name.startsWith("_x_async_")) return;
    handleAlias(name);
    if (!data[name] || data[name].loaded) return;
    const module2 = await getModule(name);
    Alpine.data(name, module2);
    data[name].loaded = true;
  }
  async function getModule(name) {
    if (!data[name]) return;
    const module2 = await data[name].download(name);
    if (typeof module2 === "function") return module2;
    let whichExport = module2[name] || module2.default || Object.values(module2)[0] || false;
    return whichExport;
  }
  function activate(el) {
    Alpine.destroyTree(el);
    el._x_ignore = false;
    el.removeAttribute(ignoreAttr);
    if (el.closest(`[${ignoreAttr}]`)) return;
    Alpine.initTree(el);
  }
  function handleAlias(name) {
    if (!alias || data[name]) return;
    if (typeof alias === "function") {
      Alpine.asyncData(name, alias);
      return;
    }
    Alpine.asyncUrl(name, alias.replaceAll("[name]", name));
  }
  function parseName(attribute) {
    const parsedName = (attribute || "").split(/[({]/g)[0];
    const ourName = parsedName || `_x_async_${index()}`;
    return ourName;
  }
  function parseUrl(url) {
    if (options.keepRelativeURLs) return url;
    const absoluteReg = new RegExp("^(?:[a-z+]+:)?//", "i");
    if (!absoluteReg.test(url)) {
      return new URL(url, document.baseURI).href;
    }
    return url;
  }
}
