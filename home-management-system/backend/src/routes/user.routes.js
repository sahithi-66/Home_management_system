import express from 'express';
import UserController from '../controllers/UserController.js';

const router = express.Router();

console.log('here')

router.get('/', UserController.userdetails);

export default router;