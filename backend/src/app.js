import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import authRoutes from './routes/auth.routes.js';
import reportRoutes from './routes/report.routes.js';
import { errorHandler } from './middleware/error.middleware.js';
import { apiLimiter } from './middleware/rateLimit.middleware.js';
import path from 'path';

const app = express();

const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: corsOrigin, credentials: true }));

app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use('/api', apiLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../frontend/dist')));
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../frontend', 'dist', 'index.html'))
    })
}

app.use(errorHandler);

export default app;
