// src/services/ChoreService.js
import Chore from '../models/Chore.js';

class ChoreService {
    constructor() {
      this.chores = [];
    }
  
    addChore({ choreName, roommates, scheduleType }) {
      const schedule = {
        id: Date.now(),
        choreName,
        roommates,
        scheduleType,
        currentIndex: 0, // Start rotation with the first roommate
        nextOccurrence: this.getNextOccurrence(scheduleType),
      };
  
      this.chores.push(schedule);
      return schedule;
    }
  
    getAllChores() {
      return this.chores.map((chore) => ({
        ...chore,
        currentAssignee: chore.roommates[chore.currentIndex],
      }));
    }
  
    getScheduleForChore(choreId) {
      const chore = this.chores.find((c) => c.id === choreId);
      if (!chore) {
        return [];
      }
  
      const scheduleRows = [];
      let currentIndex = chore.currentIndex;
      let nextOccurrence = new Date(chore.nextOccurrence);
  
      for (let i = 0; i < 10; i++) {
        scheduleRows.push({
          date: nextOccurrence,
          assignee: chore.roommates[currentIndex],
        });
  
        // Rotate to the next roommate
        currentIndex = (currentIndex + 1) % chore.roommates.length;
        nextOccurrence = this.getNextOccurrence(chore.scheduleType, nextOccurrence);
      }
  
      return scheduleRows;
    }
  
    getNextOccurrence(scheduleType, fromDate = new Date()) {
      const date = new Date(fromDate);
      switch (scheduleType) {
        case "daily":
          return new Date(date.setDate(date.getDate() + 1));
        case "weekly":
          return new Date(date.setDate(date.getDate() + 7));
        case "monthly":
          return new Date(date.setMonth(date.getMonth() + 1));
        default:
          return date;
      }
    }
  }
  
  module.exports = new ChoreService();
  