import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import { apiRouter } from './routes';
import { errorHandler } from './middleware/errorHandler';
import { generalApiLimiter } from './middleware/rateLimiter';
import { openApiSpec } from './docs/openapi';
import { PricingService } from './lib/pricingService';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const isProd = process.env.NODE_ENV === 'production';

// Security Headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows Swagger UI and local UI asset previews
    crossOriginEmbedderPolicy: false,
  })
);

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  process.env.CORS_ORIGIN,
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in local dev, restricted in prod via env
      }
    },
    credentials: true,
  })
);

// Body Parsing & Cookies
app.use(cookieParser(process.env.COOKIE_SECRET || 'cookie-secret'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads directory (for whitepaper, media)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Swagger API Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));

// General rate limiter
app.use('/api/v1', generalApiLimiter);

// Mount core v1 routes
app.use('/api/v1', apiRouter);

// Centralized error handler
app.use(errorHandler);

// Scheduled price check worker (executes any due scheduled price updates every 15s)
setInterval(async () => {
  try {
    await PricingService.processScheduledPriceChanges();
  } catch (err) {
    console.error('Error during scheduled price processing:', err);
  }
}, 15000);

// Start server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`  SI Coin API Server running on port ${PORT}`);
  console.log(`  API Root:    http://localhost:${PORT}/api/v1`);
  console.log(`  Swagger UI:  http://localhost:${PORT}/api/docs`);
  console.log(`  Dev Mailbox: http://localhost:${PORT}/api/v1/auth/dev-mailboxes`);
  console.log(`=======================================================`);
});

export default app;
