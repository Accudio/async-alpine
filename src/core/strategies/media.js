const media = (component, requirement) => {
  return new Promise(resolve => {
    const queryStart = requirement.indexOf('(');
    const query = requirement.slice(queryStart);
    const mediaQuery = window.matchMedia(query);
    if (mediaQuery.matches) {
      resolve();
      return;
    }
    mediaQuery.addEventListener('change', query => {
      if (!query.matches) return;
      if (component.status !== 'unloaded') return;
      resolve();
    });
  });
};

export default media;
