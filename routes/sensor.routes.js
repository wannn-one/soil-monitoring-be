const express = require('express');
const { saveSensorData, getSensorDataByDateRangeAndField, getSensorDataByDateRange, downloadAllSensorDataAsCSV } = require('../controllers/sensor.controllers');

const router = express.Router();

router.route('/')
  .post(saveSensorData)
  .get(getSensorDataByDateRangeAndField);

router.get('/all', getSensorDataByDateRange);

router.get('/csv', downloadAllSensorDataAsCSV);

module.exports = router;