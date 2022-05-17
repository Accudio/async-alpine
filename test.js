const handler = require('serve-handler');
const http = require('http');
const fs = require('fs-extra');
const esbuild = require('esbuild');

// copy dist over
fs.copySync('dist', 'tests/dist')

// build commonjs
esbuild.build({
  entryPoints: [ `./tests/build/module.js` ],
  bundle: true,
  outfile: `./tests/dist/module-bundle.js`,
  minify: true,
  target: [ 'es2019' ],
});

// run the web server
const server = http.createServer((request, response) => {
  return handler(request, response, {
    public: 'tests'
  });
})
server.listen(3000, () => {
  console.log('Running at http://localhost:3000');
});
