const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jsdom',
  collectCoverage: true,
  collectCoverageFrom: [
    'lib/utils.ts',
    'components/**/*.{js,jsx,ts,tsx}',
    '!components/**/*.test.{js,jsx,ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 20,
      functions: 30,
      lines: 40,
      statements: 40,
    },
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
    '<rootDir>/prisma/',
  ],
};

module.exports = createJestConfig(customJestConfig);

