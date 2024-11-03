import express from 'express';
import { TourController } from '../controllers/TourController.js';

const router = express.Router();

router.get(
  '/top-5-tours',
  TourController.getAllTours,
  TourController.getAllTours,
);

router.route('/').get(TourController.getAllTours);
router
  .route('/:id')
  .get(TourController.getSingleTour)
  .delete(TourController.deleteTour);

router.route('/tour-stats').get(TourController.getTourStats);

export const TourRoutes = router;
