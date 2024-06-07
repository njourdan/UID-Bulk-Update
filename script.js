import { razorCall } from './apicalls.js';
import { parseAttributeMapping, parseUIDList, addToFailList } from './csvProcesses.js';

function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve(event.target.result);
    reader.onerror = (error) => reject(error);
    reader.readAsText(file);
  });
}

function parseCSV(csv) {
  const lines = csv.split('\n');
  const headers = lines[0].split(',');
  const data = lines.slice(1).map(line => {
    const values = line.split(',');
    return headers.reduce((obj, header, index) => {
      obj[header.trim()] = values[index].trim();
      return obj;
    }, {});
  });
  return data;
}

async function processFiles() {
  const fileInput1 = document.getElementById('csvFile1');
  const fileInput2 = document.getElementById('csvFile2');

  if (fileInput1.files.length === 0 || fileInput2.files.length === 0) {
    alert('Please upload both CSV files.');
    return;
  }

  try {
    const csvContent1 = await readFile(fileInput1.files[0]);
    const csvContent2 = await readFile(fileInput2.files[0]);

    const attributeMappingData = parseCSV(csvContent1);
    const uidListData = parseCSV(csvContent2);

    const attributeMapping = parseAttributeMapping(attributeMappingData);
    const uidList = parseUIDList(uidListData);

    for (const uid of uidList) {
      let req = await razorCall(`/Asset/${uid}`, {});
      let uidInfo = await req.json();

      if (attributeMapping.hasOwnProperty(uidInfo.attributeSet)) {
        let newAttributes = _.unionBy(uidInfo.attributes, attributeMapping[uidInfo.attributeSet], 'typeName');
        uidInfo.attributes = newAttributes;
        console.log(uidInfo.attributes);

        let resp = await razorCall(`/Asset/${uid}`, {
          method: 'PUT',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ uidInfo }),
        });
        console.log(await resp);

        if (!resp.ok) {
          let data = [{ UID: uid, Reason: `ERROR: ${resp.status}, ${resp.statusText}` }];
          addToFailList.writeRecords(data)
            .then(() => {
              console.log('Data written to CSV file successfully.');
            })
            .catch((err) => {
              console.error('Error writing to CSV file:', err);
            });
        }
      } else {
        console.log("Doesn't include attributeSet");
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

window.processFiles = processFiles;
