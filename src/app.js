import express from 'express';

export const app = express();

// TEST ROUTE
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Hello From Express & TypeScript Server',
  });
});
