import request from 'supertest';
import app from '../app.js';
import ChoreService from '../services/ChoreService.js';

describe('Chore Management API', () => {
  const sampleChore = {
    choreName: 'Test Chore for Testing',
    assignees: ['John', 'Doe'],
    frequency: 'WEEKLY',
    start_date: '2024-12-01',
    currentIndex: 101
  };
  const sampleFailChore = {
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
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('choreName', 'Test Chore');
    },10000);

    it('should fail if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/chores/addChore')
        .send(sampleFailChore);

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/chores/fetchAll', () => {
    it('should get all chores', async () => {
      const response = await request(app).get('/api/chores/fetchAll');
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

    it('should fail if chore id is invalid', async () => {
      const response = await request(app)
        .delete('/api/chores/deleteChore/999');

      expect(response.status).toBe(400);
    });
  });
});
