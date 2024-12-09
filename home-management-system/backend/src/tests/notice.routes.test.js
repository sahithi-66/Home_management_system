import request from 'supertest';
import app from '../app.js';
import { jest } from '@jest/globals';

describe('Notice Routes', () => {
  const sampleNotice = {
    title: 'Test Notice',
    content: 'This is a test notice',
    author_id: 1,
    is_parcel: false
  };

  describe('POST /api/notices', () => {
    it('should create notice', async () => {
      const response = await request(app)
        .post('/api/notices')
        .send(sampleNotice);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'Notice created successfully');
    });

    it('should return 500 for invalid data', async () => {
      const response = await request(app)
        .post('/api/notices')
        .send({});

      expect(response.status).toBe(500);
    });
  });

  describe('GET /api/notices', () => {
    it('should return all notices', async () => {
      const response = await request(app)
        .get('/api/notices');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
    });
  });

  describe('GET /api/notices/parcels', () => {
    it('should return parcel notices', async () => {
      const response = await request(app)
        .get('/api/notices/parcels');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
    });
  });

  describe('GET /api/notices/search', () => {
    it('should search notices with term', async () => {
      const response = await request(app)
        .get('/api/notices/search')
        .query({ term: 'test' });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
    });

    it('should return 400 for missing search term', async () => {
      const response = await request(app)
        .get('/api/notices/search');

      expect(response.status).toBe(400);
    });
  });


});