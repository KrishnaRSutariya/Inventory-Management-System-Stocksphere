import express, { Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { apiRoutes } from './routes';
import { notFoundHandler } from './common/middleware/notFound.middleware';
import { errorHandler } from './common/middleware/error.middleware';
import { apiLimiter } from './common/middleware/rateLimit.middleware';
import { setupSwagger } from './config/swagger';

export const createApp = (): Express => {
  const app = express();

  // 1. Security Middleware
  app.use(
    helmet({
      contentSecurityPolicy: false, // Allows Swagger UI inline scripts
      crossOriginEmbedderPolicy: false
    })
  );

  // 2. CORS Configuration
  const allowedOrigins = [env.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'];
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(null, true); // Allow dev access gracefully
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    })
  );

  // 3. Body & Cookie Parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());

  // 4. Request Logging
  if (env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  // 5. Interactive API Documentation (Swagger)
  setupSwagger(app);

  // 6. Rate Limiting on API routes
  app.use('/api', apiLimiter);

  // 7. Mount Versioned Routes
  app.use('/api/v1', apiRoutes);

  // 8. 404 & Global Error Handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
