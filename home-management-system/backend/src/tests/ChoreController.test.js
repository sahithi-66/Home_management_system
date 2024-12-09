import request from 'supertest';
import app from '../app.js';
import { jest } from '@jest/globals';

describe('Chore API Tests', () => {
  const sampleChore = {
    choreName: 'Test Chore',
    assignees: ['John', 'Doe'],
    frequency: 'WEEKLY',
    start_date: '2024-12-01'
  };

  describe('POST /api/chores/addChore', () => {
    it('should create a new chore', async () => {
      const response = await request(app)
        .post('/api/chores/addChore')
        .send(sampleChore);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('choreName', 'Test Chore');
    });

    it('should return 400 if chore already exists', async () => {
      const response = await request(app)
        .post('/api/chores/addChore')
        .send({
          ...sampleChore,
          choreName: 'Existing Chore'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Chore already exists!!!');
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/chores/addChore')
        .send({
          assignees: ['John', 'Doe'],
          frequency: 'WEEKLY'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'All fields are required');
    });
  });

  describe('POST /api/chores/swapChoreSchedule', () => {
    it('should swap schedules successfully', async () => {
      const response = await request(app)
        .post('/api/chores/swapChoreSchedule')
        .send({
          firstScheduleId: 1,
          secondScheduleId: 2
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Schedules swapped successfully');
    });

    it('should return 400 if schedule IDs are missing', async () => {
      const response = await request(app)
        .post('/api/chores/swapChoreSchedule')
        .send({
          firstScheduleId: 1
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Both schedule IDs are required');
    });
  });

  describe('GET /api/chores/fetchAll', () => {
    it('should get all chores', async () => {
      const response = await request(app)
        .get('/api/chores/fetchAll');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
    });
  });

  describe('DELETE /api/chores/deleteChore/:id', () => {
    it('should delete a chore by id', async () => {
      const response = await request(app)
        .delete('/api/chores/deleteChore/1');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Chore deleted successfully');
    });

    it('should return 404 if chore not found', async () => {
      const response = await request(app)
        .delete('/api/chores/deleteChore/999');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Chore not found');
    });
  });

  describe('GET /api/chores/schedule/:id', () => {
    it('should get chore schedule', async () => {
      const response = await request(app)
        .get('/api/chores/schedule/1');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
    });

    it('should return 404 if chore not found', async () => {
      const response = await request(app)
        .get('/api/chores/schedule/999');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Chore not found');
    });
  });
});