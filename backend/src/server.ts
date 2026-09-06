import http from 'http';
import app from './app.js';
import { config } from './config/index.js';
import { initSocketServer } from './socket/index.js';
import { prisma } from './lib/prisma.js';

const server = http.createServer(app);

// Initialize Socket.IO real-time engine
initSocketServer(server);

async function bootstrap() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('[Database]: Successfully connected to PostgreSQL.');

    server.listen(config.PORT, config.HOST, () => {
      console.log(`\n========================================================`);
      console.log(`  AttendanceAI API Server running at http://${config.HOST}:${config.PORT}`);
      console.log(`  Swagger OpenAPI Docs at http://${config.HOST}:${config.PORT}/api/v1/docs`);
      console.log(`  Health Check at http://${config.HOST}:${config.PORT}/health`);
      console.log(`========================================================\n`);
    });
  } catch (error) {
    console.error('[Bootstrap Error]: Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown handling
process.on('SIGTERM', async () => {
  console.log('[SIGTERM] Shutting down gracefully...');
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
});

bootstrap();
