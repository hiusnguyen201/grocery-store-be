const env = process.env;

export default () => ({
  projectName: env.PROJECT_NAME,
  port: parseInt(env.PORT) || 3000,
  mongoUri: env.MONGO_URI || 'mongodb://localhost:27017/grocery-store',

  cloudinary: {
    cloudName: env.CLOUDINARY_NAME,
    apiKey: env.CLOUDINARY_API_KEY,
    apiSecret: env.CLOUDINARY_API_SECRET,
  },

  jwt: {
    expiryTime: env.JWT_EXPIRY_TIME || '7d',
    secret: env.JWT_SECRET,
  },

  mailer: {
    host: env.MAILER_HOST || 'smtp.gmail.com',
    port: env.MAILER_PORT || 465,
    user: env.MAILER_AUTH_USER,
    pass: env.MAILER_AUTH_PASS,
  },
});
