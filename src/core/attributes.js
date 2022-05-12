const getAlpineAttrs = (el, config) => {
  return [ ...el.attributes ]
    .map(el => el.name)
    .filter(attr => {
      for (let prefix of config.alpine.attributes) {
        if (attr.startsWith(prefix)) return true;
      }
      return false;
    })
    .filter(attr => attr !== `${config.alpine.prefix}cloak`);
};

const disableAttributes = (el, config) => {
  for (let attribute of el.attributes) {
    el.node.setAttribute(
      config.prefix + sanitiseAttribute(attribute),
      el.node.getAttribute(attribute)
    );
    el.node.removeAttribute(attribute);
  }
};

const enableAttributes = (el, config) => {
  for (let attribute of el.attributes) {
    const sanitisedAttr = sanitiseAttribute(attribute);
    el.node.setAttribute(sanitisedAttr,
      el.node.getAttribute(config.prefix + sanitisedAttr)
    );
    el.node.removeAttribute(config.prefix + sanitisedAttr);
  }
};

const sanitiseAttribute = attribute => {
  if (attribute.startsWith('@')) {
    return 'x-on:' + attribute.slice(1);
  }
  return attribute;
};

export {
  getAlpineAttrs,
  enableAttributes,
  disableAttributes,
};
