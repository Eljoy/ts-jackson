/** @type {import('jest').Config} */
module.exports = {
  clearMocks: true,

  preset: 'ts-jest',

  testEnvironment: 'node',

  testMatch: ['**/*.test.ts?(x)'],

  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
}
