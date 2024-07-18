import handler from 'serve-handler'
import http from 'http'
import fs from 'fs-extra'
import chokidar from 'chokidar'

fs.copySync('dist', 'tests/dist')
chokidar.watch(['dist/*.js']).on('change', async () => {
	// copy dist over
	fs.copySync('dist', 'tests/dist')
})

// run the web server
const server = http.createServer((request, response) => {
	return handler(request, response, {
		public: 'tests/',
	})
})
server.listen(3000, () => {
	console.log('Running at http://localhost:3000')
})
