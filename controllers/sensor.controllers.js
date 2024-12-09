const { influxDB, org, bucket } = require('../config/db');
const { Point } = require('@influxdata/influxdb-client');
const { createObjectCsvStringifier } = require('csv-writer');
const dayjs = require('dayjs');

/*
    POST /api/sensor
    Upload sensor data to InfluxDB
*/
exports.saveSensorData = async (req, res) => {
  const { nitrogen, phosphorus, potassium, ph } = req.body;

  if (!nitrogen || !phosphorus || !potassium || !ph) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    const writeApi = influxDB.getWriteApi(org, bucket, 's');

    const point = new Point('soil_data')
      .floatField('nitrogen', nitrogen)
      .floatField('phosphorus', phosphorus)
      .floatField('potassium', potassium)
      .floatField('ph', ph);

    writeApi.writePoint(point);
    await writeApi.close();

    res.status(200).json({ message: 'Data saved successfully.' });
  } catch (error) {
    console.error('Error while saving data:', error);
    res.status(500).json({ error: 'Error while saving data.' });
  }
};

/*
    GET /api/sensor?start=<start_date>&end=<end_date>
    Retrieve all sensor data from InfluxDB within a date range
*/
exports.getSensorDataByDateRange = async (req, res) => {
  const { start, end } = req.query;

  if (!start || !end) {
    return res.status(400).json({ error: 'Start and end dates are required.' });
  }

  try {
    // Konversi input tanggal menjadi rentang waktu ISO 8601
    const startISO = dayjs(start).startOf('day').toISOString(); // Menjadi YYYY-MM-DDT00:00:00Z
    const endISO = dayjs(end).endOf('day').toISOString(); // Menjadi YYYY-MM-DDT23:59:59Z

    const queryApi = influxDB.getQueryApi(org);

    // Query untuk mengambil semua data dalam rentang waktu
    const query = `
      from(bucket: "${bucket}")
        |> range(start: ${startISO}, stop: ${endISO})
        |> filter(fn: (r) => r._measurement == "soil_data")
    `;

    const results = [];
    queryApi.queryRows(query, {
      next(row, tableMeta) {
        const data = tableMeta.toObject(row);
        results.push(data);
      },
      error(error) {
        console.error('Error while retrieving data:', error);
        res.status(500).json({ error: 'Error while retrieving data.' });
      },
      complete() {
        res.status(200).json({ message: 'Data retrieved successfully.', data: results });
      },
    });
  } catch (error) {
    console.error('Error while retrieving data:', error);
    res.status(500).json({ error: 'Error while retrieving data.' });
  }
};

/*
    GET /api/sensor?start=<start_date>&end=<end_date>&field=<field>
    Retrieve sensor data from InfluxDB within a date range
*/
exports.getSensorDataByDateRangeAndField = async (req, res) => {
  const { start, end, field } = req.query;

  // Validasi input: Pastikan start dan end diberikan
  if (!start || !end) {
    return res.status(400).json({ error: 'Start and end dates are required.' });
  }

  try {
    // Konversi input tanggal menjadi rentang waktu ISO 8601
    const startISO = dayjs(start).startOf('day').toISOString(); // Menjadi YYYY-MM-DDT00:00:00Z
    const endISO = dayjs(end).endOf('day').toISOString(); // Menjadi YYYY-MM-DDT23:59:59Z

    const queryApi = influxDB.getQueryApi(org);

    const fieldFilter = field ? `|> filter(fn: (r) => r._field == "${field}")` : '';

    const query = `
      from(bucket: "${bucket}")
        |> range(start: ${startISO}, stop: ${endISO})
        |> filter(fn: (r) => r._measurement == "soil_data")
        ${fieldFilter}
    `;

    const results = [];
    queryApi.queryRows(query, {
      next(row, tableMeta) {
        const data = tableMeta.toObject(row);
        results.push(data);
      },
      error(error) {
        console.error('Error while retrieving data:', error);
        res.status(500).json({ error: 'Error while retrieving data.' });
      },
      complete() {
        res.status(200).json( {message: 'Data retrieved successfully.', data: results} );
      },
    });
  } catch (error) {
    console.error('Error while retrieving data:', error);
    res.status(500).json({ error: 'Error while retrieving data' });
  }
};

/*
    GET /api/sensor/csv?start=<start_date>&end=<end_date>
    Download all sensor data as CSV
*/
exports.downloadAllSensorDataAsCSV = async (req, res) => {
  const { start, end } = req.query;

  if (!start || !end) {
    return res.status(400).json({ error: 'Start and end dates are required.' });
  }

  try {
    // Konversi input tanggal menjadi rentang waktu ISO 8601
    const startISO = dayjs(start).startOf('day').toISOString(); // YYYY-MM-DDT00:00:00Z
    const endISO = dayjs(end).endOf('day').toISOString(); // YYYY-MM-DDT23:59:59Z

    const queryApi = influxDB.getQueryApi(org);

    const query = `
      from(bucket: "${bucket}")
        |> range(start: ${startISO}, stop: ${endISO})
        |> filter(fn: (r) => r._measurement == "soil_data")
    `;

    const rawData = [];
    queryApi.queryRows(query, {
      next(row, tableMeta) {
        const data = tableMeta.toObject(row);
        rawData.push(data);
      },
      error(error) {
        console.error('Error while retrieving data for CSV:', error);
        res.status(500).json({ error: 'Error while retrieving data for CSV.' });
      },
      complete() {
        // Gabungkan data berdasarkan timestamp
        const mergedData = mergeDataByTimestamp(rawData);

        // Buat CSV
        const csvStringifier = createObjectCsvStringifier({
          header: [
            { id: 'no', title: 'No' },
            { id: 'timestamp', title: 'Timestamp' },
            { id: 'nitrogen', title: 'Nitrogen' },
            { id: 'ph', title: 'pH' },
            { id: 'potassium', title: 'Potassium' },
            { id: 'phosphorus', title: 'Phosphorus' },
          ],
        });

        const csvHeader = csvStringifier.getHeaderString();
        const csvBody = csvStringifier.stringifyRecords(mergedData);

        // Kirim file CSV ke response
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename="all_sensor_data_${start}_${end}.csv"`
        );
        res.status(200).send(csvHeader + csvBody);
      },
    });
  } catch (error) {
    console.error('Error while retrieving data for CSV:', error);
    res.status(500).json({ error: 'Error while retrieving data for CSV.' });
  }
};

// Helper function untuk menggabungkan data berdasarkan timestamp
function mergeDataByTimestamp(rawData) {
  const merged = {};

  // Gabungkan data berdasarkan timestamp
  rawData.forEach((item) => {
    const timestamp = item._time;
    if (!merged[timestamp]) {
      merged[timestamp] = {
        timestamp,
        nitrogen: null,
        ph: null,
        potassium: null,
        phosphorus: null,
      };
    }
    merged[timestamp][item._field] = item._value;
  });

  // Konversi ke array dan tambahkan nomor urut
  return Object.values(merged).map((item, index) => ({
    no: index + 1,
    ...item,
  }));
}