const event = ({ component, argument }) => {
  return new Promise(resolve => {
    if (argument) {
      // if there's an argument use that as a custom event name
      window.addEventListener(
        argument,
        () => resolve(),
        { once: true }
      );

    } else {
      // otherwise listen for async-alpine:load event with id as detail
      const cb = e => {
        if (e.detail.id !== component.id) return;
        window.removeEventListener('async-alpine:load', cb);
        resolve();
      };
      window.addEventListener('async-alpine:load', cb);
    }
  });
};

export default event;
