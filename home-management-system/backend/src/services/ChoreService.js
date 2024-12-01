import Chore from '../models/Chore.js';

class ChoreService {
    async createChore(choreData) {
        if (!choreData.title) {
            throw new Error('Title is required');
        }
        return await Chore.create(choreData);
    }

    async createChoreWithSchedule(choreData, scheduleData) {
        if (!choreData.title || !scheduleData.scheduleType || !scheduleData.roommates) {
            throw new Error('Missing required fields');
        }

        if (!['DAILY', 'WEEKLY', 'MONTHLY'].includes(scheduleData.scheduleType.toUpperCase())) {
            throw new Error('Invalid schedule type');
        }

        scheduleData.scheduleType = scheduleData.scheduleType.toUpperCase();
        
        return await Chore.createWithSchedule(choreData, scheduleData);
    }

    async getAllChores() {
        return await Chore.findAll();
    }

    async getChoreById(id) {
        const chore = await Chore.findById(id);
        if (!chore) {
            throw new Error('Chore not found');
        }
        return chore;
    }

    async updateChore(id, choreData) {
        const chore = await Chore.findById(id);
        if (!chore) {
            throw new Error('Chore not found');
        }
        console.log("Crossed Finding Chore part")
        const success = await Chore.update(id, choreData);
        if (!success) {
            throw new Error('Failed to update chore');
        }

        return await this.getChoreById(id);
    }

    async deleteChore(id) {
        const success = await Chore.delete(id);
        if (!success) {
            throw new Error('Chore not found');
        }
        return true;
    }

    async getChoreSchedule(id) {
        const schedule = await Chore.getSchedule(id);
        if (!schedule) {
            throw new Error('Chore schedule not found');
        }
        return schedule;
    }

    async rotateChoreAssignment(id) {
        return await Chore.rotateAssignment(id);
    }
}

export default new ChoreService();