/** Plain Node environment so the real fetch is available (jest-expo mocks it). */
module.exports = {
  rootDir: '..',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/e2e/**/*.e2e.ts'],
  transform: { '\.[jt]sx?$': ['babel-jest', { presets: ['babel-preset-expo'] }] },
  moduleNameMapper: {
    '^@/config$': '<rootDir>/e2e/config.stub.ts',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
