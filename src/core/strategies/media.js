const media = (component, requirement) => {
  return new Promise(resolve => {
    const queryStart = requirement.indexOf('(');
    const query = requirement.slice(queryStart);
    const mediaQuery = window.matchMedia(query);
    if (mediaQuery.matches) {
      resolve();
    } else {
      mediaQuery.addEventListener('change', resolve, { once: true });
    }
  });
};

export default media;
