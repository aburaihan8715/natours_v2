import { UserService } from '../services/UserService.js';
import catchAsync from '../utils/catchAsync.js';
import sendResponse from '../utils/sendResponse.js';
import httpStatus from 'http-status';
import sendResponseNotFoundData from '../utils/sendResponseNotFoundData.js';

// GET TOP 5 USERS
const getAliasUsers = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-createdAt';
  next();
};

// GET ALL USERS
const getAllUsers = catchAsync(async (req, res, next) => {
  const query = { ...req.query, isDeleted: { $ne: true } };

  const result = await UserService.getAllUsersFromDB(query);

  if (!result || result?.result.length < 1) {
    return sendResponseNotFoundData(res);
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Data retrieved successfully!',
    meta: result.meta,
    data: result.result,
  });
});

// GET SINGLE USER
const getSingleUser = catchAsync(async (req, res, next) => {
  const userId = req.params.id;
  const user = await UserService.getSingleUserFromDB(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Data retrieved successfully!',
    data: user,
  });
});

// DELETE USER
const deleteUser = catchAsync(async (req, res) => {
  const userId = req.params.id;
  const deletedUser = await UserService.deleteUserFromDB(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User deleted successfully!',
    data: deletedUser,
  });
});

// GET USER STATS
const getUserStats = catchAsync(async (req, res) => {
  const userStats = await UserService.getUserStatsFromDB();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User stats fetched successfully!',
    data: userStats,
  });
});

export const UserController = {
  getAliasUsers,
  getAllUsers,
  getSingleUser,
  deleteUser,
  getUserStats,
};
