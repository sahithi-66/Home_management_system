import request from 'supertest';
import app from '../app.js';
import AuthController from '../controllers/AuthController.js';

describe('Authentication API', () => {
  const sampleLogin = {
    roomid: 'testroom',
    username: 'testuser',
    password: 'testpassword'
  };

  function generateUniqueString(prefix) {
    return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  }
  
  const sampleCreateRoom = {
    roomid: generateUniqueString('room'),
    username: generateUniqueString('user'),
    password: generateUniqueString('pass'),
    "roomcode": 1234
  };
  describe('POST /api/auth/login', () => {
    it('should log in a user with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send(sampleLogin);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
    });

    it('should fail if credentials are invalid', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ ...sampleLogin, password: 'wrongpassword' });

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/auth/roomregistration', () => {
    it('should create a new room and user', async () => {
      const response = await request(app)
        .post('/api/auth/roomregistration')
        .send(sampleCreateRoom);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'Room created successfully');
    });

    it('should fail if room already exists', async () => {
      const response = await request(app)
        .post('/api/auth/roomregistration')
        .send(sampleLogin);

      expect(response.status).toBe(400);
    });
  });


  describe('POST /api/auth/userregistration', () => {
    // it('should create a new user', async () => {
    //   const newUser = { roomid: 'room123', username: 'user123', password: 'pass123' };
    //   const response = await request(app)
    //     .post('/api/auth/userregistration')
    //     .send(newUser);
    
    //   expect(response.status).toBe(201);
    //   expect(response.body).toHaveProperty('id');
    //   expect(response.body).toHaveProperty('message', 'User created successfully');
    // });

    it('should fail if user already exists', async () => {
      const newUser = { ...sampleLogin, roomcode: '1234' }; // Adjust as necessary
      const response = await request(app)
        .post('/api/auth/userregistration')
        .send(newUser);

      expect(response.status).toBe(400);
    });
  });
});