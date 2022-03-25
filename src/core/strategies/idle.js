const idle = () => {
  return new Promise(resolve => {
    window.requestIdleCallback(() => {
      resolve();
    });
  });
};

export default idle;
