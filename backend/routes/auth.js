import express from 'express';
import { registerUser } from '../controllers/authControllers.js';
const router = express.Router();

router.get('/user/register').post(registerUser);

export default router;