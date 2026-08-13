import "dotenv/config";

import app from "./app.js";
import connectDB from "./config/db.js";
import { getEncryptionConfig } from "./config/encryption.js";

const PORT = process.env.PORT || 5000;

getEncryptionConfig();

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`PrivateAI Agent API running on port ${PORT}`);
    });
  } catch (error) {
    console.error(`Server startup failed: ${error.message}`);
    process.exit(1);
  }
};

startServer();