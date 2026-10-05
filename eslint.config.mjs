// ESLint 9 flat config: Next core-web-vitals, typescript-eslint strict type-checked, jsx-a11y strict (spec §5).
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import jsxA11y from "eslint-plugin-jsx-a11y";
import tseslint from "typescript-eslint";

export default defineConfig([
  globalIgnores([
    ".next/**",
    "out/**",
    "next-env.d.ts",
    "playwright-report/**",
    "test-results/**",
    ".wrangler/**",
  ]),
  ...nextVitals,
  ...nextTs,
  // eslint-config-next already registers the jsx-a11y plugin; only its strict rule set is layered on.
  { rules: jsxA11y.flatConfigs.strict.rules },
  {
    files: ["**/*.{ts,tsx,mts}"],
    extends: [
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    // Plain JS config and hook scripts have no type information.
    files: ["**/*.{js,mjs}"],
    extends: [tseslint.configs.disableTypeChecked],
  },
]);
