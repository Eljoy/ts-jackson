/** @type {import('jest').Config} */
module.exports = {
  projects: [
    {
      displayName: 'legacy-decorators',
      preset: 'ts-jest',
      testEnvironment: 'node',
      clearMocks: true,
      testMatch: ['**/*.test.ts?(x)'],
      testPathIgnorePatterns: [
        '/node_modules/',
        '/dist/',
        'standardDecorators.test.ts',
      ],
    },
    {
      displayName: 'standard-decorators',
      testEnvironment: 'node',
      clearMocks: true,
      testMatch: ['**/standardDecorators.test.ts'],
      transform: {
        '^.+\\.tsx?$': [
          'ts-jest',
          {
            tsconfig: {
              experimentalDecorators: false,
              emitDecoratorMetadata: false,
              target: 'ES2022',
            },
          },
        ],
      },
    },
  ],
}
