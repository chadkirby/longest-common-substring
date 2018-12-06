module.exports = {
  root: true,
  parserOptions: { ecmaVersion: 2017 },
  env: {
    'es6': true
  },
  extends: [
    'plugin:turbopatent/node'
  ],
  rules: {
    'no-var': 'error',
    'eol-last': 1
  }
};
