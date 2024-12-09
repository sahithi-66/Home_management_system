// src/tests/utils/test-utils.js

// Mock response helper
export const createMockResponse = () => {
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis()
    };
    return res;
  };
  
  // Mock request helper
  export const createMockRequest = (body = {}, params = {}, query = {}) => ({
    body,
    params,
    query
  });
  
  // Database mock helpers
  export const mockDbResponse = (data) => [data, []];
  
  export const mockDbError = (error) => {
    throw error;
  };
  
  // Date helper for consistent testing
  export const mockDate = (isoDate) => {
    const RealDate = Date;
    global.Date = class extends RealDate {
      constructor() {
        super();
        return new RealDate(isoDate);
      }
      static now() {
        return new RealDate(isoDate).getTime();
      }
    };
  };
  
  // Express middleware test helper
  export const mockMiddleware = (middleware, req, res, next = jest.fn()) => {
    return middleware(req, res, next);
  };