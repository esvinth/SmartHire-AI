const app = require('./app');
const connectDB = require('./config/db');
const { port } = require('./config/env');
const logger = require('./utils/logger');

const startServer = async () => {
  await connectDB();

  app.listen(port, () => {
    logger.info(`SmartHire API server running on port ${port}`);
  });
};

startServer().catch((err) => {
  logger.error('Failed to start server:', err);
  process.exit(1);
});
