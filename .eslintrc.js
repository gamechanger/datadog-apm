module.exports = {
	"root": true,
	"env": {
		"es2020": true,
		"node": true
	},
	"extends": [
		"eslint:recommended",
		"plugin:@typescript-eslint/eslint-recommended",
		"plugin:@typescript-eslint/recommended"
	],
	"parser": "@typescript-eslint/parser",
	"parserOptions": {
		"ecmaVersion": 11,
		"sourceType": "module",
		"createDefaultProgram": true,
		"project": "./tsconfig.json"
	},
	"plugins": [
		"@typescript-eslint"
	],
	"rules": {
		"indent": [
			"error",
			"tab",
			{
				"MemberExpression": "off",
				"SwitchCase": 1
			}
		],
		"linebreak-style": [
			"error",
			"windows"
		],
		"quotes": [
			"error",
			"double"
		],
		"semi": [
			"error",
			"always"
		],
		"no-template-curly-in-string": "error",
		"brace-style": [
			"error",
			"stroustrup"
		],
		"no-const-assign": "error",
		"no-var": "error",
		"no-console": [
			"error"
		]
	}
};
