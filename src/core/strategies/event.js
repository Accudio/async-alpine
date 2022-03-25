const event = component => {
  return new Promise(resolve => {
    window.addEventListener('alpine-async:load', e => {
      if (e.detail.id !== component.id) return;
      if (component.status !== 'unloaded') return;
      resolve();
    });
  });
};

export default event;
