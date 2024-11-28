import express from 'express';
import { logout, getUserDetails, deleteUser, UpdateUser, getUsers, registerUser, loginUser, getUserProfile } from '../controllers/authControllers.js';
import { isAuthenticatedUser } from '../middlewares/auth.js';
const router = express.Router();

router.route('/user/register').post(registerUser);
router.route('/user/users').get(getUsers);
router.route('/user/:id').put(UpdateUser);
router.route('/user/:id').delete(deleteUser);
router.route('/user/:id').get(getUserDetails);

// for user login and logout
router.route('/login').post(loginUser);
router.route('/logout').get(logout);

router.route('/me').get(isAuthenticatedUser, getUserProfile)

export default router;