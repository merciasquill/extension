import eslint from "@eslint/js";
import * as tsParser from "@typescript-eslint/parser";
import { defineConfig, globalIgnores } from "eslint/config";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import importPlugin from "eslint-plugin-import";
import jsxA11y from "eslint-plugin-jsx-a11y";
import reactPlugin from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import unusedImports from "eslint-plugin-unused-imports";
import globals from "globals";
import { configs as tsConfigs } from "typescript-eslint";

const eslintConfig = defineConfig([
  eslint.configs.recommended,
  tsConfigs.recommended,

  importPlugin.flatConfigs.recommended,
  importPlugin.flatConfigs.typescript,

  jsxA11y.flatConfigs.recommended,

  reactPlugin.configs.flat.recommended,
  reactPlugin.configs.flat["jsx-runtime"],
  reactHooks.configs.flat.recommended,

  eslintConfigPrettier,

  globalIgnores([
    "**/.DS_Store",
    ".ignore/**",
    ".next/**",
    ".output/**",
    ".wxt/**",
    "build/**",
    "dist/**",
    "next-env.d.ts",
    "node_modules/**",
    "out/**",
    "public/**",
  ]),

  {
    plugins: {
      "unused-imports": unusedImports,
    },
  },

  {
    settings: {
      "import/resolver": { typescript: true, node: true },
      react: { version: "detect" },
    },
  },

  {
    languageOptions: {
      globals: {
        ...Object.fromEntries(
          Object.entries(globals.browser).map(([key]) => [key, "off"])
        ),
        ...globals.webextensions,
        ...globals.node,
      },

      parser: tsParser,
      ecmaVersion: 12,
      sourceType: "module",

      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },

  {
    rules: {
      "no-console": "warn",

      "no-unused-vars": "off",
      "unused-imports/no-unused-vars": "off",

      "@typescript-eslint/consistent-type-imports": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          args: "after-used",
          ignoreRestSiblings: false,
          argsIgnorePattern: "^_.*?$",
        },
      ],

      "import/no-duplicates": "warn",
      "import/no-dynamic-require": "warn",
      "import/order": [
        "warn",
        {
          alphabetize: { order: "asc", caseInsensitive: true },

          pathGroups: [
            { pattern: "@/types/**", group: "type" },

            { pattern: "@models/**", group: "internal", position: "after" },
            { pattern: "@redis/**", group: "internal", position: "after" },
            { pattern: "@utils/**", group: "internal", position: "after" },

            { pattern: "@api/**", group: "internal", position: "after" },
            { pattern: "@auth/**", group: "internal", position: "after" },
            { pattern: "@www/**", group: "internal", position: "after" },

            { pattern: "@svg/**", group: "internal", position: "after" },

            { pattern: "@/**", group: "internal", position: "after" },
          ],

          groups: [
            "type",
            "builtin",
            "object",
            "external",
            "internal",
            ["sibling", "parent"],
            "index",
          ],

          "newlines-between": "always",
        },
      ],

      "unused-imports/no-unused-imports": "warn",

      "jsx-a11y/click-events-have-key-events": "warn",
      "jsx-a11y/interactive-supports-focus": "warn",

      "react/prop-types": "off",
      "react/jsx-uses-react": "off",
      "react/react-in-jsx-scope": "off",
      "react-hooks/exhaustive-deps": "off",
      "react/self-closing-comp": "warn",
      "react/jsx-sort-props": [
        "warn",
        {
          callbacksLast: true,
          shorthandFirst: true,
          noSortAlphabetically: false,
          reservedFirst: true,
        },
      ],
    },
  },
]);

export default eslintConfig;
