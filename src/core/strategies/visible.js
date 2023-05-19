const visible = ({ component, argument }) => {
  return new Promise(resolve => {
    // work out if a rootMargin has been specified, and if so take it from the requirement
    const rootMargin = argument || '0px 0px 0px 0px';
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        observer.disconnect();
        resolve();
      }
    }, { rootMargin });
    observer.observe(component.el);
  });
};

export default visible;
