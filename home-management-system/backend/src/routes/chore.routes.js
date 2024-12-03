import express from 'express';
import ChoreController from '../controllers/ChoreController.js';

const router = express.Router();

// Create routes
router.post('/', ChoreController.createChore);
router.post('/rotation', ChoreController.createChoreWithSchedule);

// Read routes
router.get('/', ChoreController.getAllChores);
router.get('/:id', ChoreController.getChoreById);
router.get('/:id/schedule', ChoreController.getChoreSchedule);

// Update routes
router.put('/:id', ChoreController.updateChore);
router.post('/:id/rotate', ChoreController.rotateChoreAssignment);

// Delete route
router.delete('/:id', ChoreController.deleteChore);

export default router;
