module.exports = {
  extends: [
    // add more generic rulesets here, such as:
    // 'eslint:recommended',
    'plugin:vue/vue3-recommended',
    // 'plugin:vue/vue3-essential', // This option doesn't impose formatting rules
    // 'plugin:vue/vue3-strongly-recommended', // This option imposes formatting rules on your code to improve readability 
  ],
  rules: {
    // override/add rules settings here, such as:
    'indent':'off',
    'vue/html-indent':'off',
    'vue/html-closing-bracket-newline':'off',
    'vue/multiline-html-element-content-newline':'off',
    'vue/singleline-html-element-content-newline':'off',
    'vue/attributes-order':'off',
    'vue/require-prop-types':'off',
    'vue/no-unused-vars': 'error',
    "vue/max-attributes-per-line": ["error", {
      "singleline": {
        "max": 6
      },      
      "multiline": {
        "max": 6
      }}],
      "vue/html-self-closing": ["error", {
        "html": {
          "void": "any",
          "normal": "always",
          "component": "always"
        },
        "svg": "always",
        "math": "always"
      }],
    'no-undef': 'error',
  }
}