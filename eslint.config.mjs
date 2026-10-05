// ESLint 10 flat config on eslint-config-next (core-web-vitals + typescript), typescript-eslint strict type-checked, jsx-a11y strict (spec §5).
import { fixupPluginRules } from '@eslint/compat';
import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import tseslint from 'typescript-eslint';

// eslint-config-next bundles eslint-plugin-react, -import and -jsx-a11y, which still call context APIs that
// ESLint 10 removed. @eslint/compat's fixupPluginRules restores them; every config entry must reference the
// same fixed-up instance or ESLint reports a redefined plugin. Drop this once those plugins support ESLint 10.
const LEGACY_PLUGINS = ['react', 'import', 'jsx-a11y'];
const fixedPlugins = new Map();
const fixup = (name, plugin) => {
  if (!LEGACY_PLUGINS.includes(name)) return plugin;
  if (!fixedPlugins.has(name)) fixedPlugins.set(name, fixupPluginRules(plugin));
  return fixedPlugins.get(name);
};
const withFixups = configs =>
  configs.map(config =>
    config.plugins
      ? {
          ...config,
          plugins: Object.fromEntries(
            Object.entries(config.plugins).map(([name, plugin]) => [name, fixup(name, plugin)])
          )
        }
      : config
  );

const nextConfigs = withFixups([...nextVitals, ...nextTs]);

// Reuse the bundled jsx-a11y instance for its strict rule set instead of a direct dependency whose peer range
// still lags ESLint 10.
const jsxA11y = nextVitals
  .flatMap(config => Object.entries(config.plugins ?? {}))
  .find(([name]) => name === 'jsx-a11y')?.[1];
if (!jsxA11y?.flatConfigs?.strict)
  throw new Error('eslint-config-next no longer exposes eslint-plugin-jsx-a11y');

export default defineConfig([
  globalIgnores([
    '.next/**',
    'out/**',
    'next-env.d.ts',
    'playwright-report/**',
    'test-results/**',
    '.wrangler/**'
  ]),
  ...nextConfigs,
  { rules: jsxA11y.flatConfigs.strict.rules },
  {
    files: ['**/*.{ts,tsx,mts}'],
    extends: [tseslint.configs.strictTypeChecked, tseslint.configs.stylisticTypeChecked],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname
      }
    }
  },
  {
    // Plain JS config and hook scripts have no type information.
    files: ['**/*.{js,mjs}'],
    extends: [tseslint.configs.disableTypeChecked]
  }
]);
