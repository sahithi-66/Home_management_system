export default {
  testEnvironment: 'node',
  transform: {},
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js'
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  setupFilesAfterEnv: ['<rootDir>/src/tests/setupTests.js'],
  verbose: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  moduleDirectories: ['node_modules', 'src'],
  roots: ['<rootDir>/src'],
  testPathIgnorePatterns: ['/node_modules/'],
  transformIgnorePatterns: [
    'node_modules/(?!(module-that-needs-to-be-transformed)/)'
  ],
  coveragePathIgnorePatterns: [
    'node_modules',
    // 'src/models/Notice.js',
    // 'src/controllers/UserController.js',
    // 'src/controllers/GroceryController.js',
    // 'src/services',
    // 'src/routes/auth.routes.js'
    
  ]
};