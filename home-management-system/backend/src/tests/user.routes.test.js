import request from 'supertest';
import express from 'express';
import router from '../routes/user.routes';
import UserController from '../controllers/UserController';

jest.mock('../controllers/UserController');

const app = express();
app.use(express.json());
app.use('/user', router);

describe('User Routes', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /user', () => {
        it('should call UserController.userdetails', async () => {
            // Arrange
            UserController.userdetails.mockImplementation((req, res) => res.status(200).json({ message: 'Fetched user details' }));

            // Act
            const response = await request(app).get('/user');

            // Assert
            expect(UserController.userdetails).toHaveBeenCalled();
            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Fetched user details');
        });
    });
});