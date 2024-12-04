import db from '../config/database.js';

class Chore {

    

    static async addChore(chore) {
        // console.log('in add chore model');
        // console.log('INSERT INTO chores (choreName, roommates, scheduleType, currentIndex, nextOccurrence) VALUES (?, ?, ?, ?)',
        //     [chore.choreName, chore.assignees, chore.frequency, chore.currentIndex, chore.start_date ]);
        const [result] = await db.execute(
            'INSERT INTO chores (choreName, roommates, scheduleType, currentIndex, nextOccurrence) VALUES (?, ?, ?, ?, ?)',
            [chore.choreName, chore.assignees, chore.frequency, chore.currentIndex, chore.start_date ]
          );
          return result.insertId;
    };

    static async getAllChores() {
       
        const [result] = await db.execute(
            'SELECT * FROM chores'
          );
          return result;
    };

    static async addSchedule(schedule) {
        const formatDateForMySQL = (date) => {
            const year = date.getUTCFullYear();
            const month = String(date.getUTCMonth() + 1).padStart(2, '0');
            const day = String(date.getUTCDate()).padStart(2, '0');
            const hours = String(date.getUTCHours()).padStart(2, '0');
            const minutes = String(date.getUTCMinutes()).padStart(2, '0');
            const seconds = String(date.getUTCSeconds()).padStart(2, '0');
            return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        };
        // Mock database logic: Add the schedule to the database
        const query = 'INSERT INTO schedule (chore_id, chore_name, assigned_to, scheduled_date, completed, created_at, updated_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)';
            
        const values = [
            schedule.newChoreId,                          // chore_id
            schedule.choreName,                // chore_name
            schedule.assignedTo,               // assigned_to
            formatDateForMySQL(schedule.scheduledDate),            // scheduled_date
            schedule.completed || false,       // completed (default to false if not provided)
        ];

        console.log(values);

        const [result] = await db.execute(query, values);
        //console.log("Schedule saved to database:", schedule);
    };

    static async fetchChoreCount(choreName) {
        const checkChoreQuery = 'SELECT COUNT(*) AS count FROM chores WHERE choreName = ?';
        const checkChoreValues = [choreName];
        //console.log(checkChoreQuery);
        const [result] = await db.execute(checkChoreQuery, checkChoreValues);
        return result
    }

    static async deleteChoreById(choreId) {
        const scheduleQuery = "DELETE FROM schedule WHERE chore_id = ?";
        await db.execute(scheduleQuery, [choreId]);
        const query = "DELETE FROM chores WHERE id = ?";
        const [result] = await db.execute(query, [choreId]);
    
        // Check if any row was deleted
        return result.affectedRows > 0;
    }

    static async fetchSchedule(choreID, formattedDate) {
        const query = `
                SELECT * FROM schedule
                WHERE chore_id = ? AND scheduled_date >= ? 
                ORDER BY scheduled_date ASC
                LIMIT 15;
            `;
        const values = [choreID, formattedDate];

       // console.log(query);

        //console.log(values);
            
            // Execute the query
        const [schedules] = await db.execute(query, values);
            
            // Return the schedules if found, otherwise an empty array
        return schedules;
    }

    static async getById(scheduleId) {
        const query = 'SELECT * FROM schedule WHERE id = ?';
        const [rows] = await db.execute(query, [scheduleId]);
        return rows[0];
    }

    static async updateAssignedTo(scheduleId, newAssignedTo) {
        const query = 'UPDATE schedule SET assigned_to = ? WHERE id = ?';
        const [result] = await db.execute(query, [newAssignedTo, scheduleId]);
        return result;
    }
}

export default Chore;
