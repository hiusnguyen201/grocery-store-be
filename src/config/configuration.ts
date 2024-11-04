const env = process.env;

export default () => ({
  port: parseInt(env.PORT) || 3000,
  mongoUri: env.MONGO_URI || 'mongodb://localhost:27017/grocery-store',

  cloudinary: {
    cloudName: env.CLOUD_NAME,
    apiKey: env.CLOUD_API_KEY,
    apiSecret: env.CLOUD_API_SECRET,
  },
});
