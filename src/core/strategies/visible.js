const visible = (component, requirement) => {
  return new Promise(resolve => {
    // work out if a rootMargin has been specified, and if so take it from the requirement
    let rootMargin = '0px 0px 0px 0px';
    if (requirement.indexOf('(') !== -1) {
      const rootMarginStart = requirement.indexOf('(') + 1;
      rootMargin = requirement.slice(rootMarginStart, -1);
    }

    const observer = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) return;
      observer.unobserve(component.root.node);
      resolve();
    }, { rootMargin });
    observer.observe(component.root.node);
  });
};

export default visible;
