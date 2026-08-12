import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ success: true, message: 'PrivateAI Agent API is running' });
});

export default router;
