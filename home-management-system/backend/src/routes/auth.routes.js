import express from 'express';
import AuthController from '../controllers/AuthController.js';
import User from '../models/User.js';

const router = express.Router();

router.post('/login', AuthController.login);

router.get('/fetchcode/:roomid', async (req, res, next) => {
    try {
        const { roomid } = req.params;
        const ogcode = await User.fetchcode(roomid);
        res.status(200).json(ogcode.roomcode);
    } catch (error) {
        next(error);
    }
});


router.post('/roomregistration', async (req, res, next) => {
    try {
        //console.log("room registration started");
        const { roomid, username, password } = req.body;
        
        const roomCount = await User.fetchRoomCount(roomid);
        
        if(roomCount.count>0){
            return res.status(400).json({ message: "Room Name already exists!!!" });
        }
        const roomcode = await Math.floor(1000 + Math.random() * 9000);
        //console.log(roomcode);
        const userId = await User.create(roomid, username, password, roomcode);
        res.status(201).json({ id: userId, message: 'Room created successfully' });
    } catch (error) {
        next(error);
    }
});

router.post('/userregistration', async (req, res, next) => {
    try {
        const { roomid, username, password, roomcode  } = req.body;
        const ogcode = await User.fetchcode(roomid);
        if(ogcode.roomcode != roomcode){
            return res.status(400).json({ message: "Invalid code" });
        }
        const roomCount = await User.findUsernameCount(username, roomid);
        if(roomCount.count>0){
            return res.status(400).json({ message: "User Name already exists!!!" });
        }

        const userId = await User.create(roomid, username, password, roomcode);
        res.status(201).json({ id: userId, message: 'User created successfully' });
    } catch (error) {
        next(error);
    }
});

router.delete('/delete/user/', async (req, res, next) => {
    try {
        const { roomid, username } = req.body;
        const userId = await User.deleteUser(username, roomid);
        const roomcode = await Math.floor(1000 + Math.random() * 9000);
        await User.updateRoomCode(roomid, roomcode);
        res.status(201).json({ id: userId, message: 'User deleted successfully' });
    } catch (error) {
        next(error);
    }
});



router.get('/:roomid', AuthController.getAllUsers);

export default router;