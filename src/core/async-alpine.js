import { Component } from './component.js';
import * as strategies from './strategies/index.js';

import config from './config/index.js';

let idIndex = 1;

const AsyncAlpine = (Alpine, opts = {}) => {
  // instance of AsyncAlpine
  const instance = {
    config,
    components: [],
    moduleCache: {},
  };

  // if a prefix or AlpinePrefix has been passed in from `opt`, update config
  if (opts.prefix) instance.config.prefix = opts.prefix;
  if (opts.alpinePrefix) {
    instance.config.alpine.prefix = opts.alpinePrefix;
    instance.config.alpine.attributes.push(opts.alpinePrefix);
  }

  // get ell elements in the DOM with `ax-load` attribute
  const roots = document.querySelectorAll(`[${config.prefix}${config.root}]`);
  if (!roots) return;

  // for each root, get the loading strategy and any alpine elements controlled by this component
  for (let root of roots) {
    const component = new Component(root, instance, idIndex++);
    instance.components.push(component);
  }

  // for each component, get the loading strategy and any alpine elements controlled by this component
  for (let component of instance.components) {
    // disable this component
    component.deactivate();

    // split strategy into parts
    const requirements = component.strategy
      .split('|')
      .map(requirement => requirement.trim())
      .filter(requirement => requirement !== 'immediate')
      .filter(requirement => requirement !== 'eager');

    // if no requirements then load immediately
    if (!requirements.length) {
      component.download(Alpine);
      continue;
    }

    // set up promises for loading
    let promises = [];
    for (let requirement of requirements) {

      // idle using requestIdleCallback
      if (requirement === 'idle') {
        promises.push(
          strategies.idle()
        );
        continue;
      }

      // visible using intersectionObserver
      if (requirement.startsWith('visible')) {
        promises.push(
          strategies.visible(component, requirement)
        );
        continue;
      }

      // media query
      if (requirement.startsWith('media')) {
        promises.push(
          strategies.media(component, requirement)
        );
        continue;
      }

      // event
      if (requirement === 'event') {
        promises.push(
          strategies.event(component)
        );
      }

      // parents
      if (requirement === 'parent' || requirement === 'parents') {
        for (let parentId of component.parents) {
          let parent = instance.components.find(component => component.id === parentId);
          promises.push(
            strategies.parent(
              component,
              parent.id,
              parent.status
            )
          );
        }
      }

    }

    // wait for all promises (requirements) to resolve and then download component
    Promise.all(promises)
      .then(() => {
        component.download(Alpine);
      });
  }
};

export { AsyncAlpine };
