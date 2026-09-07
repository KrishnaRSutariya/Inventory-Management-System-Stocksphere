import { createApp } from './app';
import { connectDatabase } from './config/db';
import { env } from './config/env';

const startServer = async () => {
  try {
    await connectDatabase();

    const app = createApp();

    const server = app.listen(env.PORT, () => {
      console.log('====================================================');
      console.log(`🚀 Inventory Server running in [${env.NODE_ENV}] mode`);
      console.log(`📡 Listening on http://localhost:${env.PORT}`);
      console.log(`📖 Swagger API Docs available at http://localhost:${env.PORT}/api-docs`);
      console.log(`⚡ API Health Check at http://localhost:${env.PORT}/api/v1/health`);
      console.log('====================================================');
    });

    const gracefulShutdown = (signal: string) => {
      console.log(`\nReceived ${signal}. Shutting down gracefully...`);
      server.close(() => {
        console.log('HTTP server closed.');
        process.exit(0);
      });

      setTimeout(() => {
        console.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error: any) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
