import fs from 'fs';
import csv from 'csv-parser';
import { parse } from 'csv-parse/sync';
import {createObjectCsvWriter} from 'csv-writer'
export const parseAttributeMapping = async (filePath) => {
    return new Promise((resolve, reject) => {
      const results = {};
      let currentAttributeSet = '';
  
      fs.createReadStream(filePath)
        .pipe(csv({ headers: ['Header', 'header', 'value'], skipLines: 1 }))
        .on('data', (row) => {
          const { Header, header, value: newValue } = row;
          if (Header) {
            currentAttributeSet = Header.trim();
            results[currentAttributeSet] = [];
          } else if (header && newValue) {
            results[currentAttributeSet].push({
              'typeName': header.trim(),
              'value': newValue.trim(),
            });
          }
        })
        .on('end', () => {
          resolve(results);
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  };
export const parseUIDList = (filePath) => {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    });
    return records.map(item => item.UID);;
  };
export const addToFailList = createObjectCsvWriter({
  path: './CSVs/fails.csv',
  header: [
    {id: 'UID', title: 'UID'},
    {id: 'Reason', title: 'Reason'}

  ],
  append: fs.existsSync('./CSVs/fails.csv')
})