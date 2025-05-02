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