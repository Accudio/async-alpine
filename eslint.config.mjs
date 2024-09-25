import globals from 'globals'
import js from '@eslint/js'
import stylistic from '@stylistic/eslint-plugin'

export default [
	{
		...stylistic.configs.customize({
			indent: 'tab',
			quotes: 'single',
			semi: false,
			jsx: false,
		}),
		files: ['src/**/*.js'],
	},
	{
		plugins: {'@stylistic': stylistic},
		...js.configs.recommended,
		files: ['src/**/*.js'],

		languageOptions: {
			globals: globals.browser,
			ecmaVersion: 2020,
			sourceType: 'module',
		},
		rules: {
			'@stylistic/no-multiple-empty-lines': [
				'error',
				{ max: 2 },
			],
			'eqeqeq': 'error',
			'no-console': [
				'error',
				{ allow: ['error'] },
			],
		},
	},
]
