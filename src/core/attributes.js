import config from './config/index.js';

const getAlpineAttrs = el => {
  return [ ...el.attributes ]
    .map(el => el.name)
    .filter(attr => {
      for (let prefix of config.alpine.prefixes) {
        if (attr.startsWith(prefix)) return true;
      }
      return false;
    })
    .filter(attr => attr !== config.alpine.cloak);
};

const disableAttributes = el => {
  for (let attribute of el.attributes) {
    el.node.setAttribute(
      config.prefix + attribute,
      el.node.getAttribute(attribute)
    );
    el.node.removeAttribute(attribute);
  }
};

const enableAttributes = el => {
  for (let attribute of el.attributes) {
    el.node.setAttribute(attribute,
      el.node.getAttribute(config.prefix + attribute)
    );
    el.node.removeAttribute(config.prefix + attribute);
  }
};

export {
  getAlpineAttrs,
  enableAttributes,
  disableAttributes,
};
