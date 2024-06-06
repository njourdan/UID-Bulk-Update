import fs from 'fs';
import csv from 'csv-parser';

export const parseAttributeMapping = (filePath, callback) => {
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
          Attribute: header.trim(),
          'New Value': newValue.trim(),
        });
      }
    })
    .on('end', () => {
      callback(results);
    });
};
export const parseUIDList = (filePath) => {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    });
    return records[0];
  };
