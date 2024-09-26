const createCsvWriter = require('csv-writer').createObjectCsvWriter;

async function saveToCSV(data, filePath) {
    const csvWriter = createCsvWriter({
        path: filePath,
        header: Object.keys(data[0]).map(key => ({ id: key, title: key }))
    });

    await csvWriter.writeRecords(data);
    console.log('Data has been saved to CSV.');
}

module.exports = { saveToCSV };
