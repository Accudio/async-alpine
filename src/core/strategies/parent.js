const parent = (component, parentId, parentStatus) => {
  return new Promise(resolve => {
    // check the component isn't already loaded
    if (parentStatus !== 'unloaded') {
      return resolve();
    }

    // listen for the components load event
    window.addEventListener('async-alpine:loaded', e => {
      if (e.detail.id !== parentId) return;
      if (component.status !== 'unloaded') return;
      resolve();
    });
  });
};

export default parent;
