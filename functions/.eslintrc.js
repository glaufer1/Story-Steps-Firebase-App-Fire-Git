module.exports = {
  env: {
    node: true,
    es2021: true,
  },
  extends: [
    'google',
  ],
  rules: {
    'max-len': ['error', { code: 100 }],
  },
};