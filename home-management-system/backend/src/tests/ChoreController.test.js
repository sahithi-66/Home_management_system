import request from 'supertest';
import app from '../app.js'; // Adjust the path to your app entry point
import ChoreService from '../services/ChoreService.js';
import Chore from '../models/Chore.js';

// Mock the ChoreService and Chore model
jest.mock('../services/ChoreService.js');
jest.mock('../models/Chore.js');

describe('ChoreController', () => {
  describe('POST /api/chores/addChore', () => {
    it('should create a new chore', async () => {
      Chore.fetchChoreCount.mockResolvedValue([{ count: 0 }]);
      ChoreService.addNewChoreWithSchedule.mockResolvedValue(1);

      const response = await request(app)
        .post('/api/chores/addChore')
        .send({
          choreName: 'Test Chore',
          assignees: ['John', 'Doe'],
          frequency: 'WEEKLY',
          start_date: '2024-12-01'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id', 1);
      expect(response.body).toHaveProperty('choreName', 'Test Chore');
    });

    it('should return 400 if chore already exists', async () => {
      Chore.fetchChoreCount.mockResolvedValue([{ count: 1 }]);

      const response = await request(app)
        .post('/api/chores/addChore')
        .send({
          choreName: 'Test Chore',
          assignees: ['John', 'Doe'],
          frequency: 'WEEKLY',
          start_date: '2024-12-01'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Chore already exists!!!');
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/chores/addChore')
        .send({
          assignees: ['John', 'Doe'],
          frequency: 'WEEKLY',
          start_date: '2024-12-01'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'All fields are required');
    });
  });

  describe('POST /api/chores/swapChoreSchedule', () => {
    it('should swap schedules successfully', async () => {
      ChoreService.swapSchedules.mockResolvedValue(true);

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
      Chore.getAllChores.mockResolvedValue([
        { id: 1, choreName: 'Test Chore' }
      ]);

      const response = await request(app).get('/api/chores/fetchAll');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
    });
  });

  describe('DELETE /api/chores/deleteChore/:id', () => {
    it('should delete a chore by id', async () => {
      Chore.deleteChoreById.mockResolvedValue(true);

      const response = await request(app).delete('/api/chores/deleteChore/1');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Chore deleted successfully');
    });

    it('should return 404 if chore not found', async () => {
      Chore.deleteChoreById.mockResolvedValue(false);

      const response = await request(app).delete('/api/chores/deleteChore/999');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Chore not found');
    });
  });

  describe('GET /api/chores/getChoreSchedule/:id', () => {
    it('should get chore schedule', async () => {
      ChoreService.getScheduleForChore.mockResolvedValue([
        { id: 1, choreName: 'Test Chore', nextOccurrence: '2024-12-01' }
      ]);

      const response = await request(app).get('/api/chores/getChoreSchedule/1');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('length', 1);
    });

    it('should return 404 if chore not found', async () => {
      ChoreService.getScheduleForChore.mockResolvedValue([]);

      const response = await request(app).get('/api/chores/getChoreSchedule/999');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Chore not found');
    });
  });
});