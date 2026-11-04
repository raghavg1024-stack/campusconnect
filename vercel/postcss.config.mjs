import path from 'node:path';
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
    [path.resolve(process.cwd(), 'scripts/postcss-cleanup.cjs')]: {},
  },
};

export default config;
