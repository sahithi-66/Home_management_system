
import request from 'supertest';
import app from '../app.js';
import { jest } from '@jest/globals';
import NoticeService from '../services/NoticeService.js';

describe('Notice Board API', () => {
  const sampleNotice = {
    title: 'Test Notice',
    content: 'This is a test notice',
    author_id: 1,
    is_parcel: false
  };

  describe('POST /api/notices', () => {
    it('should create a new notice', async () => {
      const response = await request(app)
        .post('/api/notices')
        .send(sampleNotice);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('message', 'Notice created successfully');
    });

    it('should fail if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/notices')
        .send({});

      expect(response.status).toBe(500);
    });
  });

  describe('GET /api/notices', () => {
    it('should get all notices', async () => {
      const response = await request(app).get('/api/notices');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
    });

    it('should filter notices by parcel status', async () => {
      const response = await request(app)
        .get('/api/notices')
        .query({ is_parcel: true });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
      response.body.forEach(notice => {
        expect(notice.is_parcel).toBeTruthy();
      });
    });
  });

  describe('GET /api/notices/search', () => {
    it('should search notices by term', async () => {
      const response = await request(app)
        .get('/api/notices/search')
        .query({ term: 'test' });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
    });

    it('should fail if search term is missing', async () => {
      const response = await request(app)
        .get('/api/notices/search');

      expect(response.status).toBe(400);
    });
  });
});