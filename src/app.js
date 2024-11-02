import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import httpStatus from 'http-status';

import { AuthRoutes } from './routes/authRote.js';

import notFoundRouteHandler from './middlewares/notFoundRouteHandler.js';
import globalErrorHandler from './middlewares/globalErrorHandler.js';
import { UserRoutes } from './routes/userRoute.js';

export const app = express();

// MIDDLEWARES
app.use(morgan('dev'));
app.use(express.json({ limit: '10kb' }));
app.use(cors());

// DEVELOPMENT LOGGING
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
// TEST MIDDLEWARE
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// TEST ROUTE
app.get('/', (req, res) => {
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Hello From Server',
  });
});

// ROUTES
app.use('/api/v1/auth', AuthRoutes);
app.use('/api/v1/users', UserRoutes);

// app.use('/api/v1/users', userRouter);
// app.use('/api/v1/carts', cartRouter);
// app.use('/api/v1/orders', orderRouter);
// app.use('/api/v1/products', productRouter);
// app.use('/api/v1/stripe', stripeRouter);

// NOT FOUND ROUTE HANDLER
app.use(notFoundRouteHandler);

// GLOBAL ERROR HANDLER
app.use(globalErrorHandler);
