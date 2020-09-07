module.exports = {
	parser: "@typescript-eslint/parser",
	parserOptions: {
		ecmaVersion: 6,
		sourceType: "module",
		ecmaFeatures: {
			modules: true,
		},
	},
	plugins: ["@typescript-eslint", "react-hooks"],
	rules: {
		"react-hooks/rules-of-hooks": "error",
		"react-hooks/exhaustive-deps": "warn",
	},
}
