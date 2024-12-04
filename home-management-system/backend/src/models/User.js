import db from '../config/database.js';
import bcrypt from "bcryptjs"


class User {
    
    static async fetchRoomCount(roomid) {
        const [rows] = await db.execute('SELECT COUNT(*) AS count FROM users WHERE roomid = ?', [roomid]);
        return rows[0];
    }

    static async fetchcode(roomid) {
        const [rows] = await db.execute('SELECT DISTINCT roomcode FROM users WHERE roomid = ?', [roomid]);
        return rows[0];
    }

    static async updateRoomCode(roomid, roomcode) {
        const [rows] = await db.execute('UPDATE users SET  roomcode = ?  WHERE roomid = ?', [roomcode, roomid]);
        return rows[0];
    }

    static async findByUsername(username, roomid) {
        const [rows] = await db.execute('SELECT * FROM users WHERE username = ? and roomid = ?', [username, roomid]);
        return rows[0];
    }

    static async findUsernameCount(username, roomid) {
        const [rows] = await db.execute('SELECT COUNT(*) AS count FROM users WHERE username = ? and roomid = ?', [username, roomid]);
        console.log(rows[0]);
        return rows[0];
    }

    static async deleteUser(username, roomid) {
        const [rows] = await db.execute('DELETE FROM users WHERE username = ? and roomid = ?', [username, roomid]);
        return rows[0];
    }

    static async create(roomid, username, password, roomcode) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await db.execute('INSERT INTO users (roomid, username, password, roomcode) VALUES (?, ?, ?, ?)', [roomid, username, hashedPassword, roomcode]);
        return result.id;
    }

    static async findAll(roomid) {
        const [rows] = await db.execute('SELECT id, username as name FROM users where roomid = ?', [roomid]);
        return rows;
    }

    static async findAllUsers(roomid) {
        try {
            const [rows] = await db.execute('SELECT * FROM users where roomid = ?', [roomid]);
            return rows; // Return the rows fetched from the database
        } catch (error) {
            console.error('Error fetching users:', error);
            throw new Error('Database query failed'); // Rethrow or handle the error appropriately
        }
      }
}

export default User;
