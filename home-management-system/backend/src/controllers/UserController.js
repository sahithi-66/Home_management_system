import User from '../models/User.js';

class UserController {
    async userdetails(req, res, next) {

        console.log('USer Controller')
        

        try {
            const user = await User.findAllUsers();
            return res.json(user);
        } catch (error) {
            next(error);
        }
    }
}

export default new UserController();