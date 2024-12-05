module.exports = {
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  testEnvironment: 'node',
  coveragePathIgnorePatterns: ['/node_modules/'],
  verbose: true,
};