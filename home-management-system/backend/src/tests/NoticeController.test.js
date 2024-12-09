import request from 'supertest';
import app from '../app.js';
import { jest } from '@jest/globals';

describe('Notice Controller Tests', () => {
  const sampleNotice = {
    title: 'Test Notice',
    content: 'This is a test notice',
    author_id: 1,
    is_parcel: false
  };

  describe('createNotice', () => {
    it('should create a new notice successfully', async () => {
      const response = await request(app)
        .post('/api/notices')
        .send(sampleNotice);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'Notice created successfully');
    });

    it('should handle missing fields', async () => {
      const response = await request(app)
        .post('/api/notices')
        .send({});

      expect(response.status).toBe(500);
    });
  });

  describe('getAllNotices', () => {
    it('should get all notices', async () => {
      const response = await request(app)
        .get('/api/notices');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
    });

  });

  describe('getParcels', () => {
    it('should get all parcel notices', async () => {
      const response = await request(app)
        .get('/api/notices/parcels');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
    });
  });

  describe('searchNotices', () => {
    it('should search notices with term', async () => {
      const response = await request(app)
        .get('/api/notices/search')
        .query({ term: 'test' });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
    });

    it('should handle missing search term', async () => {
      const response = await request(app)
        .get('/api/notices/search');

      expect(response.status).toBe(400);
    });
  });
});