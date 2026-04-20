const { defineConfig } = require("eslint/config");

/** @type {import('eslint').Linter.Config[]} */
module.exports = [
  {
    ignores: [".next/**", "out/**", "build/**", "next-env.d.ts"],
  },
];