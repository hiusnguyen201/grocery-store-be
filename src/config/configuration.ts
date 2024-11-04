export default () => ({
  port: parseInt(process.env.PORT) || 3000,
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/grocery-store',
});
