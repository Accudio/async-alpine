const parent = (component, parent) => {
  return new Promise(resolve => {
    window.addEventListener('async-alpine:loaded', e => {
      if (e.detail.id !== parent) return;
      if (component.status !== 'unloaded') return;
      resolve();
    });
  });
};

export default parent;
