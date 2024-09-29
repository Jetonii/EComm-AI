import fileSystem from 'fs';
import { Parser } from 'json2csv';

export async function saveToCSV(data, filePath) {
    try {
        const json2csvParser = new Parser();
        const csv = json2csvParser.parse(data);

        fileSystem.writeFileSync(filePath, csv);
        console.log(`Data successfully saved to ${filePath}`);
    } catch (error) {
        console.error('Error saving data to CSV:', error);
    }
}