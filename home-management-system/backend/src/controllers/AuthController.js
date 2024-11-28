import jwt from 'jsonwebtoken';
import User from '../models/User.js';

class AuthController {
    async login(req, res, next) {
        const { username, password } = req.body;

        try {
            const user = await User.findByUsername(username);
            if (!user || !(await bcrypt.compare(password, user.password))) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
            res.json({ token });
        } catch (error) {
            next(error);
        }
    }
}

export default new AuthController();