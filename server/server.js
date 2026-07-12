require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');

const app = express();
app.use(cors());
app.use(express.json());



const PORT = process.env.PORT || 5000;

sequelize
  .sync({ alter: true })
  .then(() => {
    console.log('MySQL connected & tables synced');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('DB sync failed:', err.message);
    process.exit(1);
  });
