const express = require('express');
const { saveSensorData, getSensorDataByDateRange, downloadAllSensorDataAsCSV } = require('../controllers/sensor.controllers');

const router = express.Router();

router.route('/')
  .post(saveSensorData)
  .get(getSensorDataByDateRange);

router.get('/csv', downloadAllSensorDataAsCSV);

module.exports = router;