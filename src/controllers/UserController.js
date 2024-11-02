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

/*
import bcrypt from 'bcryptjs';
import createError from 'http-errors';

import { User } from '../models/userModel.js';

// ALIAS
// NOTE: if query same make alias else make features
const aliasNewUsers = async (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-createdAt';
  next();
};

// UPDATE
const updateUser = async (req, res, next) => {
  // if user changed password, make it hash
  if (req.body.password) {
    req.body.password = await bcrypt.hash(
      req.body.password,
      await bcrypt.genSalt(8)
    );
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json({ status: 'success', data: updatedUser });
  } catch (error) {
    next(error);
  }
};

// DELETE
const deleteUser = async (req, res, next) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ status: 'success', data: deletedUser });
  } catch (error) {
    next(error);
  }
};

// GET USER
const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    const { password, updatedAt, __v, ...others } = user._doc;
    res.status(200).json({ status: 'success', data: { ...others } });
  } catch (error) {
    next(error);
  }
};

// GET ALL USERS
const getAllUsers = async (req, res, next) => {
  try {
    // BUILD QUERY
    // 1A) Filtering
    const queryObj = { ...req.query };
    const excludeFields = ['page', 'sort', 'limit', 'fields', 'search'];
    excludeFields.forEach((el) => delete queryObj[el]);

    // 1B) Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    let query = User.find(JSON.parse(queryStr));

    // 2) searching
    if (req.query.search) {
      const search = req.query.search || '';
      const searchRegexp = new RegExp(`.*${search}.*`, 'i');

      const queryBySearch = {
        $or: [
          { name: { $regex: searchRegexp } },
          { email: { $regex: searchRegexp } },
          { phone: { $regex: searchRegexp } },
          { role: { $regex: searchRegexp } },
        ],
      };
      query = query.find(queryBySearch);
    }

    // 3) Sorting
    if (req.query.sort) {
      const sortedBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortedBy);
    } else {
      query = query.sort('-createdAt');
    }

    // 4) Field limiting
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-__v -updatedAt');
    }

    // 5) pagination
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 100;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    if (req.query.page) {
      const numUsers = await User.countDocuments();
      if (skip >= numUsers) throw createError(404, 'This page does not exist!');
    }

    // EXECUTE QUERY
    const users = await query;

    // SEND RESPONSE
    res.status(200).json({
      status: 'success',
      results: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// GET USERS STATS
const getUserStats = async (req, res, next) => {
  const date = new Date();
  const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));

  try {
    const data = await User.aggregate([
      // NOTE: if need last yser use $lte:lastYear
      { $match: { createdAt: { $gte: lastYear } } },
      {
        $project: {
          month: { $month: '$createdAt' },
        },
      },
      {
        $group: {
          _id: '$month',
          total: { $sum: 1 },
        },
      },
    ]);
    res.status(200).json({
      status: 'success',
      data: data,
    });
  } catch (error) {
    next(error);
  }
};

export {
  updateUser,
  deleteUser,
  getUser,
  getAllUsers,
  getUserStats,
  aliasNewUsers,
};
*/
