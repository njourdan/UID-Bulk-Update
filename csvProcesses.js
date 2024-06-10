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
    // Read the file content
    let fileContent = fs.readFileSync(filePath, 'utf8');
    // Split the file content into lines
    const lines = fileContent.split('\n');
    return lines
    // Check if there are more than 74 lines and remove the first 74 lines
    // if (lines.length > 74) {
    //   const updatedContent = lines.slice(74).join('\n');
  
    //   // Write the updated content back to the file
    //   fs.writeFileSync(filePath, updatedContent, 'utf8');
  
    //   // Parse the updated content
    //   const records = parse(updatedContent, {
    //     columns: true,
    //     skip_empty_lines: true
    //   });
  
    //   return records.map(item => item.UID);
    // } else {
    //   // If there are fewer than 74 lines, return an empty array
    //   return [];
    // }
  };
  
  export const addToFailList = createObjectCsvWriter({
    path: './CSVs/fails.csv',
    header: [
      { id: 'UID', title: 'UID' },
      { id: 'Reason', title: 'Reason' }
    ],
    append: fs.existsSync('./CSVs/fails.csv')
  });