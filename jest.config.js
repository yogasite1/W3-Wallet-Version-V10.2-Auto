module.exports = {
  displayName: '/development',
  collectCoverageFrom: ['<rootDir>/build/transforms/**/*.js'],
  coverageDirectory: '../coverage',
  coverageReporters: ['json'],
  resetMocks: false,
  restoreMocks: true,
  testEnvironment: 'node',
  testMatch: ['<rootDir>/build/transforms/**/*.test.js'],
  testTimeout: 2500,
};
