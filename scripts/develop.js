const chokidar = require('chokidar');
const { buildAll } = require('./build');


chokidar.watch([ './src/**/*.js' ]).on('change', async () => {
  console.log('Building...');
  await buildAll();
  console.log('Finished');
});
