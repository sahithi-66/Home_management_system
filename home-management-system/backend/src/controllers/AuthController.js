import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import bcrypt from "bcryptjs"

class AuthController {
    async login(req, res, next) {
        const { roomid, username, password } = req.body;

        try {
            const user = await User.findByUsername(username, roomid);
            if (!user || !(await bcrypt.compare(password, user.password))) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }
            const token = "";
            res.status(200).json({ token });
        } catch (error) {
            next(error);
        }
    }

    async getAllUsers(req, res, next) {
        try {
            const { roomid } = req.params;
            console.log(roomid);
            const users = await User.findAll(roomid);
            console.log(users);
            res.status(200).json(users);
        } catch (error) {
            next(error);
        }
    }
}

export default new AuthController();