export default {
  transform: {},
  testEnvironment: 'node',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/tests/**',
    '!**/node_modules/**',
  ],
  "coveragePathIgnorePatterns": [
    "node_modules",
    "test-config",
    "interfaces",
    "jestGlobalMocks.ts",
    ".module.ts",
    "<rootDir>/src/models",
    "<rootDir>/src/services",
    "<rootDir>/src/routes/expense.routes.js",
    "<rootDir>/src/controllers/ExpenseController.js",
    "<rootDir>/src/controllers/UserController.js",
    ".mock.ts"
],
  coverageDirectory: 'coverage',
  verbose: true,
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  }
};