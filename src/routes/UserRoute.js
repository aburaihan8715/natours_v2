import express from 'express';
import { UserController } from '../controllers/UserController.js';

const router = express.Router();

router.get(
  '/top-5-users',
  UserController.getAllUsers,
  UserController.getAllUsers,
);

router.route('/').get(UserController.getAllUsers);
router
  .route('/:id')
  .get(UserController.getSingleUser)
  .delete(UserController.deleteUser);

router.route('/user-stats').get(UserController.getUserStats);

export const UserRoutes = router;
