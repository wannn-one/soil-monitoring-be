const { InfluxDB } = require('@influxdata/influxdb-client');
require('dotenv').config();

const influxDB = new InfluxDB({
  url: process.env.INFLUX_URL,
  token: process.env.INFLUX_TOKEN,
});

module.exports = {
  influxDB,
  org: process.env.INFLUX_ORG,
  bucket: process.env.INFLUX_BUCKET,
};

console.log('InfluxDB connected');