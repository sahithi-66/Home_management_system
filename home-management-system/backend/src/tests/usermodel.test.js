import User from '../models/User';
import db from '../config/database';
import bcrypt from 'bcryptjs';

jest.mock('../config/database');
jest.mock('bcryptjs');

describe('User Model', () => {
    afterEach(() => {
        jest.clearAllMocks(); // Clear mocks after each test
    });

    describe('fetchRoomCount', () => {
        it('should return the count of users in a room', async () => {
            // Arrange
            const roomid = 1;
            const mockCount = { count: 5 };
            db.execute.mockResolvedValue([[mockCount]]);

            // Act
            const result = await User.fetchRoomCount(roomid);

            // Assert
            expect(db.execute).toHaveBeenCalledWith('SELECT COUNT(*) AS count FROM users WHERE roomid = ?', [roomid]);
            expect(result).toEqual(mockCount);
        });
    });

    describe('fetchcode', () => {
        it('should return the room code for a given room ID', async () => {
            // Arrange
            const roomid = 1;
            const mockRoomCode = { roomcode: 'ABCD1234' };
            db.execute.mockResolvedValue([[mockRoomCode]]);

            // Act
            const result = await User.fetchcode(roomid);

            // Assert
            expect(db.execute).toHaveBeenCalledWith('SELECT DISTINCT roomcode FROM users WHERE roomid = ?', [roomid]);
            expect(result).toEqual(mockRoomCode);
        });
    });

    describe('updateRoomCode', () => {
        it('should update the room code for a given room ID', async () => {
            // Arrange
            const roomid = 1;
            const roomcode = 'XYZ9876';
            db.execute.mockResolvedValue([{ affectedRows: 1 }]);

            // Act
            const result = await User.updateRoomCode(roomid, roomcode);

            // Assert
            expect(db.execute).toHaveBeenCalledWith('UPDATE users SET  roomcode = ?  WHERE roomid = ?', [roomcode, roomid]);
            expect(result).toEqual({ affectedRows: 1 });
        });
    });

    describe('findByUsername', () => {
        it('should find a user by username and room ID', async () => {
            // Arrange
            const username = 'JohnDoe';
            const roomid = 1;
            const mockUser = { id: 1, username: 'JohnDoe', roomid: 1 };
            db.execute.mockResolvedValue([[mockUser]]);

            // Act
            const result = await User.findByUsername(username, roomid);

            // Assert
            expect(db.execute).toHaveBeenCalledWith('SELECT * FROM users WHERE username = ? and roomid = ?', [username, roomid]);
            expect(result).toEqual(mockUser);
        });
    });

    describe('findUsernameCount', () => {
        it('should return the count of a specific username in a room', async () => {
            // Arrange
            const username = 'JohnDoe';
            const roomid = 1;
            const mockCount = { count: 2 };
            db.execute.mockResolvedValue([[mockCount]]);

            // Act
            const result = await User.findUsernameCount(username, roomid);

            // Assert
            expect(db.execute).toHaveBeenCalledWith('SELECT COUNT(*) AS count FROM users WHERE username = ? and roomid = ?', [username, roomid]);
            expect(result).toEqual(mockCount);
        });
    });

    describe('deleteUser', () => {
        it('should delete a user by username and room ID', async () => {
            // Arrange
            const username = 'JohnDoe';
            const roomid = 1;
            db.execute.mockResolvedValue([{ affectedRows: 1 }]);

            // Act
            const result = await User.deleteUser(username, roomid);

            // Assert
            expect(db.execute).toHaveBeenCalledWith('DELETE FROM users WHERE username = ? and roomid = ?', [username, roomid]);
            expect(result).toEqual({ affectedRows: 1 });
        });
    });

    describe('create', () => {
        it('should create a new user with a hashed password', async () => {
            // Arrange
            const roomid = 1;
            const username = 'JohnDoe';
            const password = 'password123';
            const roomcode = 'ABCD1234';
            const hashedPassword = 'hashedpassword';
            bcrypt.hash.mockResolvedValue(hashedPassword);
            db.execute.mockResolvedValue([{ insertId: 1 }]);

            // Act
            const result = await User.create(roomid, username, password, roomcode);

            // Assert
            expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
            expect(db.execute).toHaveBeenCalledWith(
                'INSERT INTO users (roomid, username, password, roomcode) VALUES (?, ?, ?, ?)',
                [roomid, username, hashedPassword, roomcode]
            );
            expect(result).toBe(1);
        });
    });

    describe('findAll', () => {
        it('should fetch all users in a room', async () => {
            // Arrange
            const roomid = 1;
            const mockUsers = [
                { id: 1, name: 'JohnDoe' },
                { id: 2, name: 'JaneDoe' }
            ];
            db.execute.mockResolvedValue([mockUsers]);

            // Act
            const result = await User.findAll(roomid);

            // Assert
            expect(db.execute).toHaveBeenCalledWith('SELECT id, username as name FROM users where roomid = ?', [roomid]);
            expect(result).toEqual(mockUsers);
        });
    });

    describe('findAllUsers', () => {
        it('should fetch all users in a room with detailed info', async () => {
            // Arrange
            const roomid = 1;
            const mockUsers = [
                { id: 1, username: 'JohnDoe', roomid: 1, roomcode: 'ABCD1234', password: 'hashedpassword' },
                { id: 2, username: 'JaneDoe', roomid: 1, roomcode: 'ABCD1234', password: 'hashedpassword' }
            ];
            db.execute.mockResolvedValue([mockUsers]);

            // Act
            const result = await User.findAllUsers(roomid);

            // Assert
            expect(db.execute).toHaveBeenCalledWith('SELECT * FROM users where roomid = ?', [roomid]);
            expect(result).toEqual(mockUsers);
        });
    });
});