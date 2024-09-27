module.exports = {
	root: true,
	extends: [
		'eslint:recommended',
		'airbnb-base'
	],
	parser: '@typescript-eslint/parser',
	plugins: [],
	parserOptions: {
		project: true,
		tsconfigRootDir: process.cwd()
	},
	overrides: [
		{
			files: [
				'*.ts',
				'*.tsx',
			],
			extends: [
				'airbnb-typescript/base',
			],
			rules: {},
		},
	],
	rules: {}
}