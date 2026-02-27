const app = require('../src/app');
const connectDB = require('../src/config/db');

// Connect to MongoDB once (reused across invocations in warm lambdas)
let isConnected = false;

module.exports = async (req, res) => {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
  return app(req, res);
};
