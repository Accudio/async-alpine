const media = ({ argument }) => {
  return new Promise(resolve => {
    if (!argument) {
      // eslint-disable-next-line no-console
      console.log("Async Alpine: media strategy requires a media query. Treating as 'eager'");
      return resolve();
    }

    const mediaQuery = window.matchMedia(`(${argument})`);
    if (mediaQuery.matches) {
      resolve();
    } else {
      mediaQuery.addEventListener('change', resolve, { once: true });
    }
  });
};

export default media;
