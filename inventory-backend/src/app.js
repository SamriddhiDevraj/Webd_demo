import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/auth.routes.js';
import categoryRoutes from './routes/category.routes.js';
import productRoutes from './routes/product.routes.js';
import saleRoutes from './routes/sale.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import reportRoutes from './routes/report.routes.js';
import staffRoutes from './routes/staff.routes.js';
import inviteRoutes from './routes/invite.routes.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(helmet());
app.use(cors(corsOptions));
// app.options('(.*)', cors(corsOptions));  // ← updated

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/shop/:shopId', categoryRoutes);
app.use('/api/shop/:shopId', productRoutes);
app.use('/api/shop/:shopId', saleRoutes);
app.use('/api/shop/:shopId', dashboardRoutes);
app.use('/api/shop/:shopId', reportRoutes);
app.use('/api/shop/:shopId', staffRoutes);
app.use('/api/invite', inviteRoutes);
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use(errorHandler);

export default app;