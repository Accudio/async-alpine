import esbuild from 'esbuild'

buildAll()

async function buildAll() {
	return Promise.all([
		build('script', {
			entryPoints: ['src/script.js'],
			platform: 'browser',
			minify: true,
		}),
		build('esm', {
			entryPoints: ['src/async-alpine.js'],
			platform: 'neutral',
			mainFields: ['module', 'main'],
		}),
		build('cjs', {
			entryPoints: ['src/async-alpine.js'],
			target: ['node10.4'],
			platform: 'node',
		}),
	])
}

async function build(name, options) {
	const path = `async-alpine.${name}.js`
	console.log(`Building ${name}`)

	if (process.argv.includes('--watch')) {
		let ctx = await esbuild.context({
			outfile: `./dist/${path}`,
			bundle: true,
			logLevel: 'info',
			...options,
		})
		await ctx.watch()
	}
	else {
		return esbuild.build({
			outfile: `./dist/${path}`,
			bundle: true,
			...options,
		})
	}
}
