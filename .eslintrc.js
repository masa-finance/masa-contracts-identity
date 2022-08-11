module.exports = {
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "import"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
    "google"
  ],
  env: {
    es6: true,
    browser: true,
    jest: true,
    node: true
  },
  rules: {
    // TS ESLinting rules
    "@typescript-eslint/explicit-function-return-type": 0,
    "@typescript-eslint/explicit-member-accessibility": 0,
    "@typescript-eslint/indent": 0,
    "@typescript-eslint/member-delimiter-style": 0,
    "@typescript-eslint/no-explicit-any": 0,
    "@typescript-eslint/no-var-requires": 0,
    "@typescript-eslint/no-use-before-define": 0,
    "@typescript-eslint/no-unused-vars": [
      2,
      {
        argsIgnorePattern: "^_"
      }
    ],

    // JS ESLinting rules
    "comma-dangle": ["error", "never"],
    "no-console": [
      "warn",
      {
        allow: ["warn", "error"]
      }
    ],
    indent: ["error", 2],
    "quote-props": ["error", "as-needed"],
    quotes: ["error", "double"],
    "capitalized-comments": "off",
    "max-len": [
      "warn",
      {
        code: 130
      } // 130 on GitHub, 80 on npmjs.org for README.md code blocks
    ],
    "arrow-parens": ["error", "as-needed"],
    "space-before-function-paren": [
      "error",
      {
        anonymous: "always",
        named: "never"
      }
    ],
    "no-negated-condition": "error",
    "spaced-comment": [
      "error",
      "always",
      {
        exceptions: ["/"]
      }
    ],
    "no-dupe-keys": "error",
    eqeqeq: "error",
    "arrow-spacing": [
      "error",
      {
        before: true,
        after: true
      }
    ],
    "no-multiple-empty-lines": [
      "error",
      {
        max: 1,
        maxEOF: 1,
        maxBOF: 1
      }
    ],
    "space-infix-ops": [
      "error",
      {
        int32Hint: false
      }
    ],
    "space-unary-ops": [
      "error",
      {
        words: true,
        nonwords: false
      }
    ],
    "operator-linebreak": ["error", "before"],
    "object-curly-spacing": ["error", "always"],
    "space-in-parens": ["error", "never"],
    "import/exports-last": "error",
    "require-jsdoc": 0 // TODO: `0` for now but later should be on by being removed
    // "prettier/prettier": 2 // TODO: double-check
  }
};
