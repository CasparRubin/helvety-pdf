import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import tseslint from "typescript-eslint";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Ignore minified third-party files
    "public/pdf.worker.min.mjs",
    "public/pdf-rendering-worker.js",
  ]),
  // Type-aware linting configuration
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.mts"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
    },
    rules: {
      // Allow unused variables/parameters prefixed with underscore
      // This is a common pattern for intentionally unused parameters
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
        },
      ],
      // Code quality rules - warn level for gradual adoption
      // Encourage explicit return types for better type safety and documentation
      "@typescript-eslint/explicit-function-return-type": [
        "warn",
        {
          allowExpressions: true,
          allowTypedFunctionExpressions: true,
          allowHigherOrderFunctions: true,
          allowDirectConstAssertionInArrowFunctions: true,
        },
      ],
      // Enforce consistent type definitions
      "@typescript-eslint/consistent-type-definitions": ["warn", "interface"],
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        {
          prefer: "type-imports",
          fixStyle: "separate-type-imports",
        },
      ],
      // Prevent common mistakes
      "@typescript-eslint/no-array-constructor": "warn",
      "@typescript-eslint/no-duplicate-enum-values": "error",
      "@typescript-eslint/no-extra-non-null-assertion": "warn",
      "@typescript-eslint/no-non-null-asserted-optional-chain": "error",
      // Type-aware rules (require parserOptions.project)
      "@typescript-eslint/prefer-nullish-coalescing": "warn",
      "@typescript-eslint/prefer-optional-chain": "warn",
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": [
        "error",
        {
          checksVoidReturn: {
            attributes: false, // Allow async event handlers in JSX
          },
        },
      ],
      "@typescript-eslint/await-thenable": "error",
      "@typescript-eslint/prefer-includes": "warn",
      "@typescript-eslint/prefer-string-starts-ends-with": "warn",
    },
  },
]);

export default eslintConfig;
