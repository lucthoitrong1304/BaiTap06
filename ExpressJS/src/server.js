require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize, connection } = require('./config/database');
const apiRoutes = require('./routes/api');

const app = express();
const port = process.env.PORT || 8888;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/v1/api/', apiRoutes);

(async () => {
  try {
    // Kết nối MySQL
    await connection();

    await sequelize.sync();
    console.log("✅ All models were synchronized successfully.");

    app.listen(port, () => {
      console.log(`✅ Backend Nodejs App listening on port ${port}`);
    });
  } catch (error) {
    console.log(">>> Error connecting to DB or syncing models: ", error);
  }
})();