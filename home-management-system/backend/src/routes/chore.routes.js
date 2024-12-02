import express from 'express';
import ChoreController from '../controllers/ChoreController.js';

const router = express.Router();


// Regular Chore board routes
 router.post('/addChore', ChoreController.addChore);
 router.get('/fetchAll', ChoreController.getAllChores);
 router.get('/schedule/:id', ChoreController.getChoreSchedule);
 router.delete('/deleteChore/:id', ChoreController.deleteChore);
 router.post('/swapSchedules', ChoreController.swapChoreSchedule);
// router.put('/:id', ChoreController.updateChore);
// router.delete('/:id', ChoreController.deleteChore);


export default router;
