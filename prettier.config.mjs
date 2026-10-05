// Prettier 3 with the Tailwind class-sorting plugin; the only formatter, run by the PostToolUse hook and CI (spec §5).
const config = {
  plugins: ["prettier-plugin-tailwindcss"],
  tailwindStylesheet: "./src/styles/globals.css",
};

export default config;
