const event = component => {
  return new Promise(resolve => {
    window.addEventListener('async-alpine:load', e => {
      if (e.detail.id !== component.id) return;
      if (component.status !== 'unloaded') return;
      resolve();
    });
  });
};

export default event;
