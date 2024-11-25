import express from 'express';
import cors from 'cors';
import expenseRoutes from './routes/expense.routes.js';
import noticeRoutes from './routes/notice.routes.js';
import choreRoutes from './routes/chore.routes.js';
import groceryRoutes from './routes/grocery.routes.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/expenses', expenseRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/chores', choreRoutes);
app.use('/api/groceries', groceryRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message: err.message
  });
});

export default app;