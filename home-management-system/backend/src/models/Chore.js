import db from '../config/database.js';

class Chore {
    static async create(chore) {
        const [result] = await db.execute(
            'INSERT INTO chores (title, description, assigned_to, due_date, status) VALUES (?, ?, ?, ?, ?)',
            [chore.title, chore.description, chore.assigned_to, chore.due_date, chore.status || 'PENDING']
        );
        return result.insertId;
    }

    static async createWithSchedule(chore, scheduleData) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // Create the chore
            const [choreResult] = await connection.execute(
                'INSERT INTO chores (title, description, assigned_to, due_date, status) VALUES (?, ?, ?, ?, ?)',
                [chore.title, chore.description, scheduleData.roommates[0], chore.due_date, 'PENDING']
            );
            const choreId = choreResult.insertId;

            // Create the schedule
            await connection.execute(
                'INSERT INTO chore_schedule (chore_id, schedule_type, current_assignee_index, next_occurrence, roommates) VALUES (?, ?, ?, ?, ?)',
                [
                    choreId,
                    scheduleData.scheduleType,
                    0,
                    chore.due_date,
                    JSON.stringify(scheduleData.roommates)
                ]
            );

            await connection.commit();
            return choreId;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async findAll() {
        const [rows] = await db.execute(`
            SELECT c.*, cs.schedule_type, cs.roommates, cs.next_occurrence,
                   u.username as assigned_to_name
            FROM chores c
            LEFT JOIN chore_schedule cs ON c.id = cs.chore_id
            LEFT JOIN users u ON c.assigned_to = u.id
            ORDER BY c.due_date ASC
        `);
        return rows;
    }

    static async findById(id) {
        const [rows] = await db.execute(
            'SELECT c.*, cs.schedule_type, cs.roommates, cs.next_occurrence FROM chores c LEFT JOIN chore_schedule cs ON c.id = cs.chore_id WHERE c.id = ?',
            [id]
        );
        return rows[0];
    }

    static async update(id, chore) {
        // First, check which fields actually exist in the chore object
        const updates = [];
        const values = [];
    
        if (chore.title !== undefined) {
            updates.push('title = ?');
            values.push(chore.title);
        }
        
        if (chore.description !== undefined) {
            updates.push('description = ?');
            values.push(chore.description);
        }
        
        if (chore.assigned_to !== undefined) {
            updates.push('assigned_to = ?');
            values.push(chore.assigned_to);
        }
        
        if (chore.due_date !== undefined) {
            updates.push('due_date = ?');
            values.push(chore.due_date);
        }
        
        if (chore.status !== undefined) {
            updates.push('status = ?');
            values.push(chore.status);
        }
    
        // Add the id at the end of values array
        values.push(id);
    
        // Only proceed if there are fields to update
        if (updates.length === 0) {
            throw new Error('No fields to update');
        }
    
        const query = `UPDATE chores SET ${updates.join(', ')} WHERE id = ?`;
    
        const [result] = await db.execute(query, values);
        return result.affectedRows > 0;
    }

    static async delete(id) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // Delete schedule first due to foreign key constraint
            await connection.execute('DELETE FROM chore_schedule WHERE chore_id = ?', [id]);
            
            // Then delete the chore
            const [result] = await connection.execute('DELETE FROM chores WHERE id = ?', [id]);
            
            await connection.commit();
            return result.affectedRows > 0;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async getSchedule(choreId) {
        const [rows] = await db.execute(`
            SELECT c.*, cs.schedule_type, cs.roommates, cs.next_occurrence, cs.current_assignee_index,
                   u.username as assigned_to_name
            FROM chores c
            JOIN chore_schedule cs ON c.id = cs.chore_id
            LEFT JOIN users u ON c.assigned_to = u.id
            WHERE c.id = ?
        `, [choreId]);
        
        if (rows.length === 0) return null;
    
        const chore = rows[0];
        
        // Fetch all users to map IDs to names
        const [users] = await db.execute('SELECT id, username FROM users');
        const userMap = Object.fromEntries(users.map(user => [user.id, user.username]));
        
        // Generate next 10 occurrences
        const schedule = [];
        let currentDate = new Date(chore.next_occurrence);
        let currentAssignee = chore.current_assignee_index;
    
        for (let i = 0; i < 10; i++) {
            schedule.push({
                date: currentDate.toISOString().split('T')[0],
                assignee: userMap[chore.roommates[currentAssignee]] || `User ${chore.roommates[currentAssignee]}`
            });
    
            // Calculate next date based on schedule type
            switch (chore.schedule_type) {
                case 'DAILY':
                    currentDate.setDate(currentDate.getDate() + 1);
                    break;
                case 'WEEKLY':
                    currentDate.setDate(currentDate.getDate() + 7);
                    break;
                case 'MONTHLY':
                    currentDate.setMonth(currentDate.getMonth() + 1);
                    break;
            }
    
            // Rotate assignee
            currentAssignee = (currentAssignee + 1) % chore.roommates.length;
        }
    
        return schedule;
    }

    static async rotateAssignment(id) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // Get current schedule
            const [scheduleRows] = await connection.execute(
                'SELECT * FROM chore_schedule WHERE chore_id = ?',
                [id]
            );
            
            if (scheduleRows.length === 0) throw new Error('No schedule found');

            const schedule = scheduleRows[0];
            const roommates = schedule.roommates;
            const nextIndex = (schedule.current_assignee_index + 1) % roommates.length;
            const nextAssignee = roommates[nextIndex];

            // Update schedule
            await connection.execute(
                'UPDATE chore_schedule SET current_assignee_index = ? WHERE chore_id = ?',
                [nextIndex, id]
            );

            // Update chore assignment
            await connection.execute(
                'UPDATE chores SET assigned_to = ? WHERE id = ?',
                [nextAssignee, id]
            );

            await connection.commit();
            return nextAssignee;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
}

export default Chore;
