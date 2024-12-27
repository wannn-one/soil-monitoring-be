const express = require('express');
const { getSensorDataByDateRangeAndField, getSensorDataByDateRange, downloadAllSensorDataAsCSV } = require('../controllers/sensor.controllers');

const router = express.Router();

router.get('/', getSensorDataByDateRangeAndField);

router.get('/all', getSensorDataByDateRange);

router.get('/csv', downloadAllSensorDataAsCSV);

module.exports = router;