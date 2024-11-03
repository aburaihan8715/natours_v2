import { TourService } from '../services/TourService.js';
import catchAsync from '../utils/catchAsync.js';
import sendResponse from '../utils/sendResponse.js';
import httpStatus from 'http-status';
import sendResponseNotFoundData from '../utils/sendResponseNotFoundData.js';

// GET TOP 5 TourS
const getAliasTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-createdAt';
  next();
};

// GET ALL TourS
const getAllTours = catchAsync(async (req, res, next) => {
  const query = { ...req.query, isDeleted: { $ne: true } };

  const result = await TourService.getAllToursFromDB(query);

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

// GET SINGLE Tour
const getSingleTour = catchAsync(async (req, res, next) => {
  const tourId = req.params.id;
  const Tour = await TourService.getSingleTourFromDB(tourId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Data retrieved successfully!',
    data: Tour,
  });
});

// DELETE Tour
const deleteTour = catchAsync(async (req, res) => {
  const tourId = req.params.id;
  const deletedTour = await TourService.deleteTourFromDB(tourId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Tour deleted successfully!',
    data: deletedTour,
  });
});

// GET Tour STATS
const getTourStats = catchAsync(async (req, res) => {
  const TourStats = await TourService.getTourStatsFromDB();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Tour stats fetched successfully!',
    data: TourStats,
  });
});

export const TourController = {
  getAliasTours,
  getAllTours,
  getSingleTour,
  deleteTour,
  getTourStats,
};
