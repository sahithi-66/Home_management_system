import ChoreService from '../services/ChoreService.js';

class ChoreController {
    async addChore(req, res, next) {
    const { choreName, roommates, scheduleType } = req.body;

    if (!choreName || !roommates || !scheduleType) {
      return res.status(400).json({ message: "All fields are required" });
    }
    try {
    const schedule = ChoreService.addChore({ choreName, roommates, scheduleType });
    return res.status(201).json({ message: "Chore added successfully", schedule });
    } catch (error) {
        next(error);
    }
  }

  getAllChores(req, res, next) {
    try {
    const chores = ChoreService.getAllChores();
    return res.status(200).json(chores);
    } catch (error) {
        next(error);
    }
  }

  getChoreSchedule(req, res) {
    try{
    const { id } = req.params;
    const schedule = ChoreService.getScheduleForChore(Number(id));

    if (schedule.length === 0) {
      return res.status(404).json({ message: "Chore not found" });
    }

    return res.status(200).json(schedule);
    } catch (error) {
        next(error);
    }
  }
}

export default new ChoreController();



