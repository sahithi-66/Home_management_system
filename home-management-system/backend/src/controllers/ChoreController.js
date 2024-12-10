import ChoreService from '../services/ChoreService.js';
import Chore  from '../models/Chore.js';

class ChoreController {
    async addChore(req, res, next) {
    // console.log(req.body);
    const { choreName, assignees, frequency, start_date } = req.body;
    //console.log(Chore.fetchChoreCount(choreName));
    // console.log(choreName);
    const choreCount = await Chore.fetchChoreCount(choreName);
    // console.log(choreCount[0].count);
    if(choreCount[0].count>0){
        return res.status(400).json({ message: "Chore already exists!!!" });
    }
    if (!choreName || !assignees || !frequency) {
      return res.status(400).json({ message: "All fields are required" });
    }
    try {
    // Call the addChore function from the model
    const newChoreId = await ChoreService.addNewChoreWithSchedule(choreName, assignees, frequency, start_date);
    
    res.status(201).json({
        id: newChoreId,
        choreName,
        assignees,
        frequency,
        currentIndex: 0,
        nextOccurrence: new Date(),
    });
    } catch (error) {
        next(error);
    }
  }

  async swapChoreSchedule(req, res, next) {
    // console.log(req.body);
    const { firstScheduleId, secondScheduleId} = req.body;
   // console.log(Chore.fetchChoreCount(choreName));
   // const choreCount = await Chore.fetchChoreCount(choreName);
    if (!firstScheduleId || !secondScheduleId) {
        return res.status(400).json({ message: 'Both schedule IDs are required' });
        }

        // console.log(firstScheduleId);
        // console.log(secondScheduleId);

    try {
        const result = await ChoreService.swapSchedules(firstScheduleId, secondScheduleId);
        res.status(200).json({
            message: 'Schedules swapped successfully',
            data: result,
        });
    } catch (error) {
        console.error('Error swapping schedules:', error.message);
        res.status(500).json({ message: 'Failed to swap schedules', error: error.message });
    }
    }

    async getAllChores(req, res, next) {
        try {
        const chores = await Chore.getAllChores();
        //console.log(chores);
        return res.status(200).json(chores);
        } catch (error) {
            next(error);
        }
  }

  async deleteChore(req, res, next) {
    try {
        const { id } = req.params; // Get the chore ID from the request params

        if (!id) {
            return res.status(400).json({ message: "Chore ID is required" });
        }

        // Call the service layer to delete the chore
        const result = await Chore.deleteChoreById(id);

        if (result) {
            return res.status(200).json({ message: "Chore deleted successfully" });
        } else {
            return res.status(404).json({ message: "Chore not found" });
        }
    } catch (error) {
        // Pass errors to the error-handling middleware
        next(error);
    }
}

  async getChoreSchedule(req, res, next) {
    try {
        const { id } = req.params;
        // console.log("Chore ID:", id);

        // Fetch schedule using ChoreService
        const schedule = await ChoreService.getScheduleForChore(id);

        // Handle case where no schedule is found
        if (!schedule || schedule.length === 0) {
            return res.status(404).json({ message: "Chore not found" });
        }

        // Return the schedule
        return res.status(200).json(schedule);
    } catch (error) {
        // Pass error to next middleware
        next(error);
    }
    }
}

export default new ChoreController();
