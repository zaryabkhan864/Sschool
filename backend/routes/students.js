import express from 'express'
import { createStudent } from '../controllers/studentControllers.js';
const router = express.Router();

router.route('/student/create_student').post(createStudent);

export default router;