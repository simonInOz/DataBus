module.exports = {
  extends: [
    // add more generic rulesets here, such as:
    // 'eslint:recommended',
    "plugin:vue/vue3-recommended",
    // 'plugin:vue/vue3-essential', // This option doesn't impose formatting rules
    // 'plugin:vue/vue3-strongly-recommended', // This option imposes formatting rules on your code to improve readability
  ],
  rules: {
    // override/add rules settings here, such as:
    "no-undef": "error",
  },
  globals: {
    global: true,
    require: true,
    module: true,
    process: true,
  },
  parserOptions: {
    ecmaVersion: 2022,
  },
};
