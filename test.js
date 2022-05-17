const handler = require('serve-handler');
const http = require('http');
const fs = require('fs-extra');
const chokidar = require('chokidar');

chokidar.watch([ 'dist/*.js' ]).on('change', async () => {
  // copy dist over
  fs.copySync('dist', 'tests/dist')
});

// run the web server
const server = http.createServer((request, response) => {
  return handler(request, response, {
    public: 'tests/'
  });
})
server.listen(3000, () => {
  console.log('Running at http://localhost:3000');
});
