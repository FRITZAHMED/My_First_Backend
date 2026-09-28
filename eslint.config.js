import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
	{
		ignores: [
			'dist/**',
			'node_modules/**',
			'coverage/**',
			'Prisma/**',
			'scripts/**',
			'.venv/**',
			'.kilo/**',
			'.git/**',
		],
	},
	js.configs.recommended,
	...tseslint.configs.recommended,
	{
		files: ['src/**/*.ts'],
		languageOptions: {
			ecmaVersion: 2022,
			sourceType: 'module',
			globals: { ...globals.node },
		},
		rules: {
			'@typescript-eslint/no-unused-vars': [
				'error',
				{ argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrors: 'none' },
			],
			'@typescript-eslint/consistent-type-imports': 'error',
			'no-console': 'error',
			eqeqeq: ['error', 'smart'],
			'prefer-const': 'error',
			'no-var': 'error',
			'object-shorthand': 'error',
		},
	},
	{
		// env.ts s'execute avant que le logger pino ne soit configurable :
		// il doit pouvoir signaler une configuration invalide sur la console.
		files: ['src/Config/env.ts'],
		rules: { 'no-console': 'off' },
	},
];
