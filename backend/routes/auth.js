import express from 'express';
import { getUsers, registerUser } from '../controllers/authControllers.js';
const router = express.Router();

router.route('/user/register').post(registerUser);
router.route('/user/users').get(getUsers);

export default router;