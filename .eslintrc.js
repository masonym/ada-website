/**
 * There was no ESLint config in this project at all - `npm run lint` mapped to
 * `next lint`, which silently did nothing without one. The single
 * `eslint-disable-next-line` comment in the codebase was disabling a rule that
 * was never running.
 *
 * Everything below is a warning rather than an error on purpose: the aim is to
 * stop the counts growing, not to fail CI on 50 pre-existing `any`s. Warnings
 * are visible locally and in the CI log; only real errors (from
 * next/core-web-vitals) break the build.
 */
module.exports = {
  root: true,
  extends: ['next/core-web-vitals'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
    // Apostrophes in marketing copy ("don't", "attendees'"). Sixty of them, none
    // a defect - an error here would just train people to ignore the linter.
    'react/no-unescaped-entities': 'warn',
  },
  overrides: [
    {
      // API routes run server-side, so console output lands in the hosting
      // provider's logs. Several of these print whole registration objects -
      // attendee PII, with whatever retention the platform applies.
      files: ['src/app/api/**/*.ts'],
      rules: {
        'no-console': ['warn', { allow: ['warn', 'error'] }],
      },
    },
    {
      // Node scripts and tests are expected to print, and to be loose about types.
      files: ['scripts/**/*', 'src/scripts/**/*', 'tests/**/*'],
      rules: {
        'no-console': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
  ],
  ignorePatterns: [
    'node_modules/',
    '.next/',
    '.open-next/',
    '.wrangler/',
    'out/',
    'public/',
    'test-results/',
    'next-env.d.ts',
  ],
};
