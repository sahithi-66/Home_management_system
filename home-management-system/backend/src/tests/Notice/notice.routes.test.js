// src/tests/Notice/notice.routes.test.js
import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import noticeRoutes from '../../routes/notice.routes.js';
import { mockNotice } from '../utils/notice-test-utils.js';

// Create mock controller functions
const mockController = {
  createNotice: jest.fn((req, res) => res.status(201).json({ id: 1, message: 'Notice created successfully' })),
  getAllNotices: jest.fn((req, res) => res.json([])),
  getNoticeById: jest.fn((req, res) => res.json({})),
  updateNotice: jest.fn((req, res) => res.json({ message: 'Notice updated successfully' })),
  deleteNotice: jest.fn((req, res) => res.json({ message: 'Notice deleted successfully' })),
  getParcels: jest.fn((req, res) => res.json([])),
  searchNotices: jest.fn((req, res) => res.json([]))
};

// Mock the controller module
jest.mock('../../controllers/NoticeController.js', () => ({
  default: mockController
}));

// Setup express app
const app = express();
app.use(express.json());
app.use('/api/notices', noticeRoutes);

describe('Notice Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /', () => {
    it('should create new notice', async () => {
      const newNotice = mockNotice();
      
      const response = await request(app)
        .post('/api/notices')
        .send(newNotice);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('message', 'Notice created successfully');
      expect(mockController.createNotice).toHaveBeenCalled();
    });
  });

  describe('GET /', () => {
    it('should return all notices', async () => {
      const response = await request(app)
        .get('/api/notices');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(mockController.getAllNotices).toHaveBeenCalled();
    });
  });

  describe('GET /search', () => {
    it('should search notices', async () => {
      const response = await request(app)
        .get('/api/notices/search')
        .query({ term: 'test' });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(mockController.searchNotices).toHaveBeenCalled();
    });
  });

  describe('GET /parcels', () => {
    it('should return parcel notices', async () => {
      mockController.getParcels.mockImplementation((req, res) => 
        res.json([mockNotice({ is_parcel: true })]));

      const response = await request(app)
        .get('/api/notices/parcels');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(mockController.getParcels).toHaveBeenCalled();
    });
  });

  describe('GET /:id', () => {
    it('should return notice by id', async () => {
      mockController.getNoticeById.mockImplementation((req, res) => 
        res.json(mockNotice({ id: 1 })));

      const response = await request(app)
        .get('/api/notices/1');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', 1);
      expect(mockController.getNoticeById).toHaveBeenCalled();
    });
  });

  describe('PUT /:id', () => {
    it('should update notice', async () => {
      const updatedNotice = mockNotice({ title: 'Updated Notice' });

      const response = await request(app)
        .put('/api/notices/1')
        .send(updatedNotice);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Notice updated successfully');
      expect(mockController.updateNotice).toHaveBeenCalled();
    });
  });

  describe('DELETE /:id', () => {
    it('should delete notice', async () => {
      const response = await request(app)
        .delete('/api/notices/1');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Notice deleted successfully');
      expect(mockController.deleteNotice).toHaveBeenCalled();
    });
  });
});