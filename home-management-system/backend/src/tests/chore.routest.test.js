import request from 'supertest';
import express from 'express';
import router from '../routes/chore.routes';
import ChoreController from '../controllers/ChoreController';

jest.mock('../controllers/ChoreController');

const app = express();
app.use(express.json());
app.use('/chore', router);

describe('Chore Routes', () => {
    afterEach(() => {
        jest.clearAllMocks(); // Clear mocks after each test
    });

    describe('POST /addChore', () => {
        it('should call ChoreController.addChore', async () => {
            // Arrange
            ChoreController.addChore.mockImplementation((req, res) => res.status(201).json({ message: 'Chore added successfully' }));

            // Act
            const response = await request(app).post('/chore/addChore').send({ name: 'Test Chore', assignedTo: 1 });

            // Assert
            expect(ChoreController.addChore).toHaveBeenCalled();
            expect(response.status).toBe(201);
            expect(response.body.message).toBe('Chore added successfully');
        });
    });

    describe('GET /fetchAll', () => {
        it('should call ChoreController.getAllChores', async () => {
            // Arrange
            ChoreController.getAllChores.mockImplementation((req, res) => res.status(200).json({ message: 'Fetched all chores' }));

            // Act
            const response = await request(app).get('/chore/fetchAll');

            // Assert
            expect(ChoreController.getAllChores).toHaveBeenCalled();
            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Fetched all chores');
        });
    });

    describe('GET /schedule/:id', () => {
        it('should call ChoreController.getChoreSchedule', async () => {
            // Arrange
            const choreId = 1;
            ChoreController.getChoreSchedule.mockImplementation((req, res) => res.status(200).json({ message: 'Fetched chore schedule' }));

            // Act
            const response = await request(app).get(`/chore/schedule/${choreId}`);

            // Assert
            expect(ChoreController.getChoreSchedule).toHaveBeenCalledWith(expect.any(Object), expect.any(Object));
            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Fetched chore schedule');
        });
    });

    describe('DELETE /deleteChore/:id', () => {
        it('should call ChoreController.deleteChore', async () => {
            // Arrange
            const choreId = 1;
            ChoreController.deleteChore.mockImplementation((req, res) => res.status(200).json({ message: 'Chore deleted successfully' }));

            // Act
            const response = await request(app).delete(`/chore/deleteChore/${choreId}`);

            // Assert
            expect(ChoreController.deleteChore).toHaveBeenCalledWith(expect.any(Object), expect.any(Object));
            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Chore deleted successfully');
        });
    });

    describe('POST /swapSchedules', () => {
        it('should call ChoreController.swapChoreSchedule', async () => {
            // Arrange
            ChoreController.swapChoreSchedule.mockImplementation((req, res) => res.status(200).json({ message: 'Schedules swapped successfully' }));

            // Act
            const response = await request(app).post('/chore/swapSchedules').send({ chore1Id: 1, chore2Id: 2 });

            // Assert
            expect(ChoreController.swapChoreSchedule).toHaveBeenCalled();
            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Schedules swapped successfully');
        });
    });
});