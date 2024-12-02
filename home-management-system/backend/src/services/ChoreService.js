import Chore  from '../models/Chore.js'; 

// ChoreService Implementation
class DailySchedule {
    static generate(newChoreId, choreName, assignees, today) {
        const schedules = [];
        const assigneeCount = assignees.length;
        for (let i = 0; i < 730; i++) { // 2 years
            const scheduledDate = new Date(today);
            scheduledDate.setDate(today.getDate() + i);
            schedules.push({
                newChoreId,
                choreName,
                assignedTo: assignees[i % assigneeCount],
                scheduledDate,
                completed: false,
            });
        }
        return schedules;
    }
}

class WeeklySchedule {
    static generate(newChoreId, choreName, assignees, today) {
        const schedules = [];
        const assigneeCount = assignees.length;
        for (let i = 0; i < 104; i++) { // 2 years
            const scheduledDate = new Date(today);
            scheduledDate.setDate(today.getDate() + i * 7);
            schedules.push({
                newChoreId,
                choreName,
                assignedTo: assignees[i % assigneeCount],
                scheduledDate,
                completed: false,
            });
        }
        return schedules;
    }
}

class MonthlySchedule {
    static generate(newChoreId, choreName, assignees, today) {
        const schedules = [];
        const assigneeCount = assignees.length;
        for (let i = 0; i < 24; i++) { // 2 years
            const scheduledDate = new Date(today);
            scheduledDate.setMonth(today.getMonth() + i);
            schedules.push({
                newChoreId,
                choreName,
                assignedTo: assignees[i % assigneeCount],
                scheduledDate,
                completed: false,
            });
        }
        return schedules;
    }
}

class ScheduleFactory {
    static getScheduleGenerator(frequency) {
        switch (frequency) {
            case 'Daily':
                return DailySchedule;
            case 'Weekly':
                return WeeklySchedule;
            case 'Monthly':
                return MonthlySchedule;
            default:
                throw new Error(`Invalid frequency: ${frequency}`);
        }
    }
}

class ChoreService {
    /**
     * Add a new chore and generate its schedule
     * @param {string} choreName - Name of the chore
     * @param {string[]} assignees - Array of assignees
     * @param {"daily"|"monthly"} frequency - Frequency of the chore
     * @returns {Promise<number>} ID of the newly created chore
     */
    static async addNewChoreWithSchedule(choreName, assignees, frequency) {
        const currentIndex = 0; // Default value
        const nextOccurrence = new Date(); // Placeholder for scheduling logic

        try {
            // Step 1: Add the chore to the database
            const newChoreId = await Chore.addChore({
                choreName,
                assignees,
                frequency,
                currentIndex,
                nextOccurrence,
            });

            console.log(`Chore added successfully with ID: ${newChoreId}`);

            // Step 2: Generate the schedule for the chore
            const schedules = await this.generateSchedule(newChoreId, choreName, assignees, frequency);
            await this.saveSchedules( schedules);

            console.log(`Schedules created successfully for chore ID: ${newChoreId}`);
            return newChoreId;
        } catch (error) {
            console.error("Error adding chore with schedule:", error);
            throw error;
        }
    }

    /**
     * Generate schedule entries based on frequency
     * @param {string} choreName - Name of the chore
     * @param {string[]} assignees - Array of assignees
     * @param {"daily"|"monthly"} frequency - Frequency of the chore
     * @returns {Object[]} Array of schedule objects
     */
    static  generateSchedule(newChoreId, choreName, assignees, frequency) {
        const today = new Date();
        const ScheduleGenerator = ScheduleFactory.getScheduleGenerator(frequency);
        return Promise.all(ScheduleGenerator.generate(newChoreId, choreName, assignees, today));
    }

    /**
     * Create a schedule entry
     * @param {string} choreName - Name of the chore
     * @param {string} assignee - Person assigned to the chore
     * @param {Date} date - Scheduled date
     * @returns {Object} Schedule object
     */
    static async createScheduleEntry(newChoreId, choreName, assignee, date) {
        return {
            newChoreId,
            choreName,
            assignedTo: assignee,
            scheduledDate: date,
            completed: false, // Default to not completed
        };
    }

    /**
     * Save schedules to the database
     * @param {number} choreId - ID of the chore
     * @param {Object[]} schedules - Array of schedule objects
     */
    static async saveSchedules(schedules) {
        console.log('here');
        console.log(schedules);
        if (!Array.isArray(schedules)) {
            schedules = [];  // Default to empty array
            console.log('empty array');
        }
        schedules.forEach(schedule => {
            // Handle each schedule (insert into DB, etc.)
            Chore.addSchedule(schedule);
            console.log('Saving schedule:', schedule);
        });
    }

    // Method to fetch schedules for a given chore starting from the current date
    static async getScheduleForChore(choreId) {
        try {
            // Get the current date
            const currentDate = new Date();
            // Format it to YYYY-MM-DD for comparison
            const formattedDate = currentDate.toISOString().split('T')[0];


            return await Chore.fetchSchedule(choreId, formattedDate) || [];
        } catch (error) {
            console.error("Error fetching schedule:", error);
            throw new Error('Error fetching schedule');
        }
    }

    static async swapSchedules(firstScheduleId, secondScheduleId) {
        // Fetch the first and second schedules
        const firstSchedule = await Chore.getById(firstScheduleId);
        const secondSchedule = await Chore.getById(secondScheduleId);

        if (!firstSchedule || !secondSchedule) {
            throw new Error('One or both schedules not found');
        }

        // Swap the `assigned_to` values
        await Chore.updateAssignedTo(firstScheduleId, secondSchedule.assigned_to);
        await Chore.updateAssignedTo(secondScheduleId, firstSchedule.assigned_to);

        return { firstSchedule, secondSchedule };
    }
}

export default ChoreService;

