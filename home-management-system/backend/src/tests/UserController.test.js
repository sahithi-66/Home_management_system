import request from 'supertest';
import express from 'express';
import UserController from '../controllers/UserController.js';
import User from '../models/User.js';

const app = express();
app.use(express.json());
app.use('/users', UserController);

jest.mock('../models/User.js');

describe('UserController', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should get all user details successfully', async () => {
        const users = [{ id: 1, name: 'John Doe', email: 'john@example.com' }];
        User.findAllUsers.mockResolvedValue(users);

        const response = await request(app).get('/users');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(users);
    });

    it('should handle errors when fetching user details', async () => {
        const errorMessage = 'Failed to fetch users';
        User.findAllUsers.mockRejectedValue(new Error(errorMessage));

        const response = await request(app).get('/users');

        expect(response.status).toBe(500);
    });
});