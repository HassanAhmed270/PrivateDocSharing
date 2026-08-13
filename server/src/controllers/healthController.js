const healthCheck = (req, res) => {
  return res.status(200).json({
    success: true,
    message: "PrivateAI Agent API is running"
  });
};

export { healthCheck };