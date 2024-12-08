const express = require('express');
const cors = require('cors');
const { influxDB, org } = require('./config/db');
const sensorRoutes = require('./routes/sensor.routes');
require('dotenv').config();


const app = express();

app.use(cors(
  {
    origin: '*',
    methods: ['GET,POST,PUT,DELETE'],
    allowedHeaders: ['Content-Type,Authorization']
  }
));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const baseUrl = '/api';

// app.use(`${baseUrl}/device`, require('./routes/device.route'));
// app.use(`${baseUrl}/pumpcontrol`, require('./routes/pump.route'));
// app.use(`${baseUrl}/waterlevel`, require('./routes/sensor.route'));

app.get(baseUrl, (req, res) => {
  res.json({ message: 'Welcome to Soil IoT Monitoring API' })
});

app.use(`${baseUrl}/sensor`, sensorRoutes);

app.listen(process.env.SERVER_PORT, () => {
  console.log(`Server running on port ${process.env.SERVER_PORT}`);
});