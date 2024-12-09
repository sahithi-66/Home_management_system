// src/tests/setupTests.js
import { jest } from '@jest/globals';

// Mock database connection
const mockExecute = jest.fn().mockImplementation(() => Promise.resolve([[{}], []]));

const mockConnection = {
  execute: mockExecute,
  release: jest.fn(),
  beginTransaction: jest.fn(),
  commit: jest.fn(),
  rollback: jest.fn()
};

const mockPool = {
  execute: mockExecute,
  getConnection: jest.fn().mockResolvedValue(mockConnection),
  on: jest.fn()
};

// Mock mysql2
jest.mock('mysql2/promise', () => ({
  createPool: jest.fn(() => mockPool),
  createConnection: jest.fn(() => mockPool)
}));

// Mock database config
jest.mock('../config/database.js', () => ({
  __esModule: true,
  default: mockPool,
  execute: mockExecute
}));

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.DB_HOST = 'localhost';
process.env.DB_USER = 'test';
process.env.DB_PASSWORD = 'test';
process.env.DB_NAME = 'test_db';

// Make jest and mocks globally available
global.jest = jest;
global.mockExecute = mockExecute;
global.mockPool = mockPool;
global.mockConnection = mockConnection;

beforeAll(() => {
  console.log('Starting test suite...');
});

afterEach(() => {
  jest.clearAllMocks();
});

afterAll(() => {
  console.log('Finished test suite.');
});