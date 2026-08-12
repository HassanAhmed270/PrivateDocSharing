import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectToDatabase } from './config/db.js';
import { getEncryptionConfig } from './config/encryption.js';

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

getEncryptionConfig();

async function start() {
  // Connect to DB but do not crash the process if it fails. Log clearly.
  const dbConn = await connectToDatabase(MONGODB_URI);
  if (!dbConn) {
    console.warn('Proceeding without a database connection. Some features may not work until MONGODB_URI is configured.');
  }

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
