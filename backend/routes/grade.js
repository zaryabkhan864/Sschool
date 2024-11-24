import express from 'express';
import { authorizeRoles,isAuthenticatedUser } from "../middlewares/auth.js";
const router = express.Router();





import {} from '../middlewares/auth.js';

import { createGrade, getGrades, updateGrade, deleteGrade, getGradeDetails } from '../controllers/gradeControllers.js';

router.route('/grade').post(isAuthenticatedUser, createGrade);

router.route('/grades').get(getGrades);
router.route('/grade/:id').put(updateGrade).delete(deleteGrade);

router.route('/grade/:id').get(getGradeDetails);



export default router;
