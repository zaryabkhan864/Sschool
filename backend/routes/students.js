import express from 'express'
import {
    createStudent,
    getStudents,
    updateStudent,
    deleteStudent,
    getStudentDetails
} from '../controllers/studentControllers.js';
const router = express.Router();

router.route("/student").post(createStudent);
router.route("/students").get(getStudents);
router.route("/student/:id").put(updateStudent);
router.route("/student/:id").delete(deleteStudent);
router.route("/student/:id").get(getStudentDetails);
export default router;