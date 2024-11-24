import express from 'express';
const router = express.Router();
import { newTeacher, getTeachers, updateTeacher, deleteTeacher, getTeacherDetails } from '../controllers/teacherControllers.js';

router.route('/teacher').post(newTeacher);
router.route('/teachers').get(getTeachers);
router.route('/teacher/:id').put(updateTeacher);
router.route('/teacher/:id').delete(deleteTeacher);
router.route('/teacher/:id').get(getTeacherDetails);


export default router;
