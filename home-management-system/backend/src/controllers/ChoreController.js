import ChoreService from '../services/ChoreService.js';
import Chore  from '../models/Chore.js';

class ChoreController {
    async createChore(req, res, next) {
        try {
            const choreId = await ChoreService.createChore(req.body);
            res.status(201).json({
                id: choreId,
                message: 'Chore created successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    async createChoreWithSchedule(req, res, next) {
        try {
            const choreId = await ChoreService.createChoreWithSchedule(
                req.body.chore,
                req.body.schedule
            );
            res.status(201).json({
                id: choreId,
                message: 'Chore created with schedule successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    async getAllChores(req, res, next) {
        try {
            const chores = await ChoreService.getAllChores();
            res.json(chores);
        } catch (error) {
            next(error);
        }
    }

    async getChoreById(req, res, next) {
        try {
            const chore = await ChoreService.getChoreById(req.params.id);
            res.json(chore);
        } catch (error) {
            next(error);
        }
    }

    async updateChore(req, res, next) {
        try {
            const chore = await ChoreService.updateChore(req.params.id, req.body);
            res.json({
                chore,
                message: 'Chore updated successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteChore(req, res, next) {
        try {
            await ChoreService.deleteChore(req.params.id);
            res.json({
                message: 'Chore deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    async getChoreSchedule(req, res, next) {
        try {
            const schedule = await ChoreService.getChoreSchedule(req.params.id);
            res.json(schedule);
        } catch (error) {
            next(error);
        }
    }

    async rotateChoreAssignment(req, res, next) {
        try {
            const nextAssignee = await ChoreService.rotateChoreAssignment(req.params.id);
            res.json({
                nextAssignee,
                message: 'Chore rotation successful'
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new ChoreController();