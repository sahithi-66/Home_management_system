import request from 'supertest';
import express from 'express';
import router from '../routes/auth.routes';
import AuthController from '../controllers/AuthController';
import User from '../models/User';

jest.mock('../models/User');
jest.mock('../controllers/AuthController');

const app = express();
app.use(express.json());
app.use('/auth', router);

describe('Auth Routes', () => {
    afterEach(() => {
        jest.clearAllMocks(); // Clear mocks after each test
    });

    describe('POST /login', () => {
        it('should call AuthController.login', async () => {
            // Arrange
            AuthController.login.mockImplementation((req, res) => res.status(200).json({ message: 'Login successful' }));

            // Act
            const response = await request(app).post('/auth/login').send();

            // Assert
            expect(AuthController.login).toHaveBeenCalled();
            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Login successful');
        });
    });

    describe('GET /fetchcode/:roomid', () => {
        it('should return the room code for the given room ID', async () => {
            // Arrange
            const roomid = 1;
            const mockRoomCode = { roomcode: 'ABCD1234' };
            User.fetchcode.mockResolvedValue(mockRoomCode);

            // Act
            const response = await request(app).get(`/auth/fetchcode/${roomid}`);

            // Assert
            expect(User.fetchcode).toHaveBeenCalledWith(roomid);
            expect(response.status).toBe(200);
            expect(response.body).toBe(mockRoomCode.roomcode);
        });
    });

    describe('POST /roomregistration', () => {
        it('should register a new room', async () => {
            // Arrange
            const body = { roomid: 1, username: 'JohnDoe', password: 'password123' };
            const mockRoomCount = { count: 0 };
            const mockUserId = 1;
            User.fetchRoomCount.mockResolvedValue(mockRoomCount);
            User.create.mockResolvedValue(mockUserId);

            // Act
            const response = await request(app).post('/auth/roomregistration').send(body);

            // Assert
            expect(User.fetchRoomCount).toHaveBeenCalledWith(body.roomid);
            expect(User.create).toHaveBeenCalled();
            expect(response.status).toBe(201);
            expect(response.body.message).toBe('Room created successfully');
        });

        it('should return 400 if the room name already exists', async () => {
            // Arrange
            const body = { roomid: 1, username: 'JohnDoe', password: 'password123' };
            const mockRoomCount = { count: 1 };
            User.fetchRoomCount.mockResolvedValue(mockRoomCount);

            // Act
            const response = await request(app).post('/auth/roomregistration').send(body);

            // Assert
            expect(User.fetchRoomCount).toHaveBeenCalledWith(body.roomid);
            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Room Name already exists!!!');
        });
    });

    describe('POST /userregistration', () => {
        it('should register a new user', async () => {
            // Arrange
            const body = { roomid: 1, username: 'JohnDoe', password: 'password123', roomcode: 'ABCD1234' };
            const mockRoomCode = { roomcode: 'ABCD1234' };
            const mockRoomCount = { count: 0 };
            const mockUserId = 1;
            User.fetchcode.mockResolvedValue(mockRoomCode);
            User.findUsernameCount.mockResolvedValue(mockRoomCount);
            User.create.mockResolvedValue(mockUserId);

            // Act
            const response = await request(app).post('/auth/userregistration').send(body);

            // Assert
            expect(User.fetchcode).toHaveBeenCalledWith(body.roomid);
            expect(User.findUsernameCount).toHaveBeenCalledWith(body.username, body.roomid);
            expect(User.create).toHaveBeenCalledWith(body.roomid, body.username, body.password, body.roomcode);
            expect(response.status).toBe(201);
            expect(response.body.message).toBe('User created successfully');
        });

        it('should return 400 if the room code is invalid', async () => {
            // Arrange
            const body = { roomid: 1, username: 'JohnDoe', password: 'password123', roomcode: 'WRONGCODE' };
            const mockRoomCode = { roomcode: 'ABCD1234' };
            User.fetchcode.mockResolvedValue(mockRoomCode);

            // Act
            const response = await request(app).post('/auth/userregistration').send(body);

            // Assert
            expect(User.fetchcode).toHaveBeenCalledWith(body.roomid);
            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Invalid code');
        });

        it('should return 400 if the username already exists', async () => {
            // Arrange
            const body = { roomid: 1, username: 'JohnDoe', password: 'password123', roomcode: 'ABCD1234' };
            const mockRoomCode = { roomcode: 'ABCD1234' };
            const mockRoomCount = { count: 1 };
            User.fetchcode.mockResolvedValue(mockRoomCode);
            User.findUsernameCount.mockResolvedValue(mockRoomCount);

            // Act
            const response = await request(app).post('/auth/userregistration').send(body);

            // Assert
            expect(User.fetchcode).toHaveBeenCalledWith(body.roomid);
            expect(User.findUsernameCount).toHaveBeenCalledWith(body.username, body.roomid);
            expect(response.status).toBe(400);
            expect(response.body.message).toBe('User Name already exists!!!');
        });
    });

    describe('DELETE /delete/user/', () => {
        it('should delete a user and update the room code', async () => {
            // Arrange
            const body = { roomid: 1, username: 'JohnDoe' };
            const mockUserId = 1;
            User.deleteUser.mockResolvedValue(mockUserId);
            User.updateRoomCode.mockResolvedValue(mockUserId);

            // Act
            const response = await request(app).delete('/auth/delete/user/').send(body);

            // Assert
            expect(User.deleteUser).toHaveBeenCalledWith(body.username, body.roomid);
            expect(User.updateRoomCode).toHaveBeenCalledWith(body.roomid, expect.any(Number));
            expect(response.status).toBe(201);
            expect(response.body.message).toBe('User deleted successfully');
        });
    });

    describe('GET /:roomid', () => {
        it('should call AuthController.getAllUsers', async () => {
            // Arrange
            const roomid = 1;
            AuthController.getAllUsers.mockImplementation((req, res) => res.status(200).json({ message: 'Fetched all users' }));

            // Act
            const response = await request(app).get(`/auth/${roomid}`);

            // Assert
            expect(AuthController.getAllUsers).toHaveBeenCalled();
            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Fetched all users');
        });
    });
});