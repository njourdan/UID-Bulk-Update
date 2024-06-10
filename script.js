import { parseAttributeMapping, parseUIDList, addToFailList } from './csvProcesses.js';
import { razorCall } from './apicalls.js';

function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve(event.target.result);
    reader.onerror = (error) => reject(error);
    reader.readAsText(file);
  });
}

function addToFailedEntriesTable(uid, reason) {
  const table = document.getElementById('failedEntriesTable').getElementsByTagName('tbody')[0];
  const newRow = table.insertRow();
  const uidCell = newRow.insertCell(0);
  const reasonCell = newRow.insertCell(1);
  uidCell.textContent = uid;
  reasonCell.textContent = reason;
}

function tableToCSV() {
  const table = document.getElementById('failedEntriesTable');
  const rows = Array.from(table.rows);
  return rows.map(row => Array.from(row.cells).map(cell => cell.textContent).join(',')).join('\n');
}

function downloadCSV(content, filename) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

async function processFiles() {
  const apiKey = document.getElementById('apiKey').value;
  const fileInput1 = document.getElementById('csvFile1');
  const fileInput2 = document.getElementById('csvFile2');

  if (!apiKey) {
    alert('Please enter your API key.');
    return;
  }

  if (fileInput1.files.length === 0 || fileInput2.files.length === 0) {
    alert('Please upload both CSV files.');
    return;
  }

  try {
    const csvContent1 = await readFile(fileInput1.files[0]);
    const csvContent2 = await readFile(fileInput2.files[0]);

    const attributeMapping = await parseAttributeMapping(csvContent1);
    const uidList = await parseUIDList(csvContent2);

    for (const uid of uidList) {
      console.log(uid)
      await delay(100); // Add a 500ms delay between requests
      
      let req = await razorCall(`/Asset/${uid}`, apiKey, {});
      if (!req.ok) {
        console.error(`Error fetching data for UID ${uid}: ${req.statusText}`);
        addToFailedEntriesTable(uid, `ERROR: ${req.status}, ${req.statusText}`);
        continue;
      }

      let uidInfo;
      try {
        uidInfo = await req.json();
      } catch (error) {
        addToFailedEntriesTable(uid, `ERROR: Invalid JSON response`);
        continue;
      }

      if (attributeMapping.hasOwnProperty(uidInfo.attributeSet)) {
        let newAttributes = _.unionBy(uidInfo.attributes, attributeMapping[uidInfo.attributeSet], 'typeName');
        console.log(newAttributes);
        if(JSON.stringify(uidInfo.attributes) != JSON.stringify(newAttributes)){
        uidInfo.attributes = newAttributes;
        try{
        let resp = await razorCall(`/Asset/${uid}`, apiKey, {
          method: 'PUT',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ uidInfo }),
        });
                if (!resp.ok) {
          let data = [{ UID: uid, Reason: `ERROR: ${resp.status}, ${resp.statusText}` }];
          addToFailedEntriesTable(uid, `ERROR: ${resp.status}, ${resp.statusText}`);
        }
      }catch(error){
        addToFailedEntriesTable(uid, `ERROR:Bad Put Request`);
      }

      }} else {
        addToFailedEntriesTable(uid, `Mapping doesn't have Attribute Set`);
      }
    }
  } catch (error) {
    addToFailList(123456, `Mapping doesn't have Attribute Set`);
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

window.processFiles = processFiles;
window.downloadFailedEntries = function() {
  const csvContent = tableToCSV();
  downloadCSV(csvContent, 'failed_entries.csv');
};
