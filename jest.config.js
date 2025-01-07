module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  moduleFileExtensions: ['ts'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
};
