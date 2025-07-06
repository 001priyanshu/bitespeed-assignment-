const express = require('express');
const { sequelize } = require('./config/database');
const identifyRoutes = require('./routes/identifyRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});


app.use('/identify', identifyRoutes);

async function start() {
  try {
    await sequelize.authenticate();
    console.log('✅ DB connected');
    await sequelize.sync();
    console.log('✅ Models synced');

    app.listen(PORT, () => {
      console.log(`🚀 Server is running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error connecting to DB:', error);
  }
}

start();
