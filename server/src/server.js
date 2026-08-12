import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

import app from './app.js';
import { connectToDatabase } from './config/db.js';

const PORT = Number(process.env.PORT) || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

async function startServer() {
  try {
    await connectToDatabase(MONGODB_URI);

    const server = app.listen(PORT, () => {
      console.log(`PrivateAI Agent API listening on port ${PORT}`);
    });

    const shutdown = async (signal) => {
      console.log(`${signal} received. Shutting down gracefully...`);

      server.close(async () => {
        await mongoose.connection.close();
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    console.error('Failed to start PrivateAI Agent API:', error.message);
    process.exit(1);
  }
}

startServer();
