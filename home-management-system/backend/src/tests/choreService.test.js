import ChoreService from '../services/ChoreService.js';
import Chore from '../models/Chore.js';

jest.mock('../models/Chore.js'); // Mock Chore model

describe('ChoreService', () => {
  describe('addNewChoreWithSchedule', () => {
    const sampleChore = {
      choreName: 'Test Chore for Testing',
      assignees: ['John', 'Doe'],
      frequency: 'WEEKLY',
      start_date: '2024-12-01'
    };

    const mockSchedules = [
      { assignee: 'John', dueDate: '2024-12-01' },
      { assignee: 'Doe', dueDate: '2024-12-08' }
    ];

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should successfully add a new chore with schedules for valid inputs', async () => {
      const newChoreId = 101;

      Chore.addChore.mockResolvedValue(newChoreId); // Mock successful chore creation
      ChoreService.generateSchedule = jest.fn().mockResolvedValue(mockSchedules); // Mock schedule generation
      ChoreService.saveSchedules = jest.fn().mockResolvedValue(); // Mock schedule saving

      const result = await ChoreService.addNewChoreWithSchedule(
        sampleChore.choreName,
        sampleChore.assignees,
        sampleChore.frequency,
        sampleChore.start_date
      );

      expect(Chore.addChore).toHaveBeenCalledWith({
        choreName: sampleChore.choreName,
        assignees: sampleChore.assignees,
        frequency: sampleChore.frequency,
        currentIndex: 0,
        start_date: new Date(sampleChore.start_date)
      });
      expect(ChoreService.generateSchedule).toHaveBeenCalledWith(
        newChoreId,
        sampleChore.choreName,
        sampleChore.assignees,
        sampleChore.frequency,
        new Date(sampleChore.start_date)
      );
      expect(ChoreService.saveSchedules).toHaveBeenCalledWith(mockSchedules);
      expect(result).toBe(newChoreId);
    });

    it('should fail when the chore name is missing', async () => {
      const invalidChore = { ...sampleChore, choreName: '' };

      await expect(
        ChoreService.addNewChoreWithSchedule(
          invalidChore.choreName,
          invalidChore.assignees,
          invalidChore.frequency,
          invalidChore.start_date
        )
      ).rejects.toThrow('Chore name is required');
    });

    it('should throw an error if the assignees array is empty', async () => {
      const invalidChore = { ...sampleChore, assignees: [] };

      await expect(
        ChoreService.addNewChoreWithSchedule(
          invalidChore.choreName,
          invalidChore.assignees,
          invalidChore.frequency,
          invalidChore.start_date
        )
      ).rejects.toThrow('At least one assignee is required');
    });

    it('should handle errors and clean up if schedule generation fails', async () => {
      const newChoreId = 102;

      Chore.addChore.mockResolvedValue(newChoreId);
      ChoreService.generateSchedule.mockRejectedValue(new Error('Failed to generate schedule'));
      Chore.deleteChoreById = jest.fn().mockResolvedValue(true); // Mock chore cleanup

      await expect(
        ChoreService.addNewChoreWithSchedule(
          sampleChore.choreName,
          sampleChore.assignees,
          sampleChore.frequency,
          sampleChore.start_date
        )
      ).rejects.toThrow('Failed to generate schedule');

      expect(Chore.deleteChoreById).toHaveBeenCalledWith(newChoreId);
    });

    it('should return empty schedules when frequency is invalid', async () => {
      const invalidFrequencyChore = { ...sampleChore, frequency: 'INVALID' };

      await expect(
        ChoreService.addNewChoreWithSchedule(
          invalidFrequencyChore.choreName,
          invalidFrequencyChore.assignees,
          invalidFrequencyChore.frequency,
          invalidFrequencyChore.start_date
        )
      ).rejects.toThrow('Invalid frequency: INVALID');
    });

    it('should handle cleanup if chore creation fails', async () => {
      Chore.addChore.mockRejectedValue(new Error('Failed to add chore'));
      Chore.deleteChoreById = jest.fn();

      await expect(
        ChoreService.addNewChoreWithSchedule(
          sampleChore.choreName,
          sampleChore.assignees,
          sampleChore.frequency,
          sampleChore.start_date
        )
      ).rejects.toThrow('Failed to add chore');

      expect(Chore.deleteChoreById).not.toHaveBeenCalled();
    });

    it('should not attempt to create schedules when the chore was never added', async () => {
      Chore.addChore.mockRejectedValue(new Error('Database error'));

      await expect(
        ChoreService.addNewChoreWithSchedule(
          sampleChore.choreName,
          sampleChore.assignees,
          sampleChore.frequency,
          sampleChore.start_date
        )
      ).rejects.toThrow('Database error');

      expect(ChoreService.generateSchedule).not.toHaveBeenCalled();
      expect(ChoreService.saveSchedules).not.toHaveBeenCalled();
    });
  });

  describe('getScheduleForChore', () => {
    it('should return a list of schedules for a given chore', async () => {
      const choreId = 101;
      const mockSchedule = [
        { assignedTo: 'John', scheduledDate: '2024-12-01' },
        { assignedTo: 'Doe', scheduledDate: '2024-12-08' }
      ];

      Chore.fetchSchedule.mockResolvedValue(mockSchedule);

      const result = await ChoreService.getScheduleForChore(choreId);

      expect(result).toEqual(mockSchedule);
      expect(Chore.fetchSchedule).toHaveBeenCalledWith(choreId, expect.any(String)); // Expects date format string
    });

    it('should return an empty array if no schedules are found for a given chore', async () => {
      const choreId = 102;
      Chore.fetchSchedule.mockResolvedValue([]);

      const result = await ChoreService.getScheduleForChore(choreId);

      expect(result).toEqual([]);
      expect(Chore.fetchSchedule).toHaveBeenCalledWith(choreId, expect.any(String));
    });

    it('should throw an error if there is an issue fetching the schedule', async () => {
      const choreId = 103;
      Chore.fetchSchedule.mockRejectedValue(new Error('Error fetching schedule'));

      await expect(ChoreService.getScheduleForChore(choreId)).rejects.toThrow('Error fetching schedule');
    });
  });
});
