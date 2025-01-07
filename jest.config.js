module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  moduleFileExtensions: ['ts', 'js'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
  },
};
