import Chore from '../models/Chore';
import db from '../config/database';
import { jest } from '@jest/globals';

jest.mock('../config/database');

describe('Chore Model', () => {
    afterEach(() => {
        jest.clearAllMocks(); // Clear mocks after each test
    });

    describe('addChore', () => {
        it('should insert a chore into the database and return the insertId', async () => {
            // Arrange
            const mockInsertId = 1;
            const chore = {
                choreName: 'Test Chore',
                assignees: 'John, Jane',
                frequency: 'weekly',
                currentIndex: 0,
                start_date: '2024-12-05'
            };
            db.execute.mockResolvedValue([{ insertId: mockInsertId }]);

            // Act
            const result = await Chore.addChore(chore);

            // Assert
            expect(db.execute).toHaveBeenCalledWith(
                'INSERT INTO chores (choreName, roommates, scheduleType, currentIndex, nextOccurrence) VALUES (?, ?, ?, ?, ?)',
                [chore.choreName, chore.assignees, chore.frequency, chore.currentIndex, chore.start_date]
            );
            expect(result).toBe(mockInsertId);
        });
    });

    describe('getAllChores', () => {
        it('should fetch all chores from the database', async () => {
            // Arrange
            const mockChores = [
                { id: 1, choreName: 'Test Chore', roommates: 'John', scheduleType: 'weekly' },
                { id: 2, choreName: 'Another Chore', roommates: 'Jane', scheduleType: 'daily' }
            ];
            db.execute.mockResolvedValue([mockChores]);

            // Act
            const result = await Chore.getAllChores();

            // Assert
            expect(db.execute).toHaveBeenCalledWith('SELECT * FROM chores');
            expect(result).toEqual(mockChores);
        });
    });

    describe('addSchedule', () => {
        it('should insert a schedule into the database', async () => {
            // Arrange
            const schedule = {
                newChoreId: 1,
                choreName: 'Test Chore',
                assignedTo: 'John',
                scheduledDate: new Date('2024-12-05T00:00:00Z'),
                completed: false
            };
            db.execute.mockResolvedValue([{ insertId: 1 }]);

            // Act
            await Chore.addSchedule(schedule);

            // Assert
            expect(db.execute).toHaveBeenCalledWith(
                'INSERT INTO schedule (chore_id, chore_name, assigned_to, scheduled_date, completed, created_at, updated_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
                [
                    schedule.newChoreId,
                    schedule.choreName,
                    schedule.assignedTo,
                    expect.stringMatching(/2024-12-05 \d{2}:\d{2}:\d{2}/), // Ensure MySQL formatted date
                    schedule.completed
                ]
            );
        });
    });

    describe('fetchChoreCount', () => {
        it('should return the count of chores with a specific name', async () => {
            // Arrange
            const choreName = 'Test Chore';
            const mockCount = [{ count: 2 }];
            db.execute.mockResolvedValue([mockCount]);

            // Act
            const result = await Chore.fetchChoreCount(choreName);

            // Assert
            expect(db.execute).toHaveBeenCalledWith(
                'SELECT COUNT(*) AS count FROM chores WHERE choreName = ?',
                [choreName]
            );
            expect(result).toEqual(mockCount);
        });
    });

    describe('deleteChoreById', () => {
        it('should delete a chore by ID and its schedule', async () => {
            // Arrange
            const choreId = 1;
            db.execute.mockResolvedValue([{ affectedRows: 1 }]);

            // Act
            const result = await Chore.deleteChoreById(choreId);

            // Assert
            expect(db.execute).toHaveBeenCalledWith('DELETE FROM schedule WHERE chore_id = ?', [choreId]);
            expect(db.execute).toHaveBeenCalledWith('DELETE FROM chores WHERE id = ?', [choreId]);
            expect(result).toBe(true);
        });

        it('should return false if no rows were deleted', async () => {
            // Arrange
            const choreId = 1;
            db.execute.mockResolvedValue([{ affectedRows: 0 }]);

            // Act
            const result = await Chore.deleteChoreById(choreId);

            // Assert
            expect(result).toBe(false);
        });
    });

    describe('fetchSchedule', () => {
        it('should fetch schedules for a given chore and date', async () => {
            // Arrange
            const choreID = 1;
            const formattedDate = '2024-12-05 00:00:00';
            const mockSchedules = [{ id: 1, assigned_to: 'John', scheduled_date: formattedDate }];
            db.execute.mockResolvedValue([mockSchedules]);

            // Act
            const result = await Chore.fetchSchedule(choreID, formattedDate);

            // Assert
            expect(db.execute).toHaveBeenCalledWith(
                `
                SELECT * FROM schedule
                WHERE chore_id = ? AND scheduled_date >= ? 
                ORDER BY scheduled_date ASC
                LIMIT 15;
            `,
                [choreID, formattedDate]
            );
            expect(result).toEqual(mockSchedules);
        });
    });

    describe('updateAssignedTo', () => {
        it('should update the assigned_to field of a schedule', async () => {
            // Arrange
            const scheduleId = 1;
            const newAssignedTo = 'Jane';
            const mockResult = { affectedRows: 1 };
            db.execute.mockResolvedValue([mockResult]);

            // Act
            const result = await Chore.updateAssignedTo(scheduleId, newAssignedTo);

            // Assert
            expect(db.execute).toHaveBeenCalledWith(
                'UPDATE schedule SET assigned_to = ? WHERE id = ?',
                [newAssignedTo, scheduleId]
            );
            expect(result).toEqual(mockResult);
        });
    });
});