import db from '../config/database.js';
import bcrypt from "bcryptjs"


class User {
    static async findByUsername(username) {
        const [rows] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
        return rows[0];
    }

    static async create(username, password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await db.execute('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);
        return result.insertId;
    }

    static async findAll() {
        const [rows] = await db.execute('SELECT id, username as name FROM users');
        return rows;
    }
}

export default User;
