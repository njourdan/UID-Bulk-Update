import _ from 'lodash'
import { razorCall } from "./apicalls.js";
import { parseAttributeMapping, parseUIDList, addToFailList } from "./csvProcesses.js";
async function run() {
const attributeMappingPromise = parseAttributeMapping("./CSVs/Attributemapping.csv");
const uidListPromise = parseUIDList('./CSVs/UIDlist.csv');
const [attributeMapping, uidList] = await Promise.all([attributeMappingPromise, uidListPromise]);
for (const uid of uidList) {
    let req = await razorCall(`/Asset/${uid}`,{})
    let uidInfo =await req.json()
    if(attributeMapping.hasOwnProperty(uidInfo.attributeSet)){
        let newAttributes = _.unionBy(uidInfo.attributes, attributeMapping[uidInfo.attributeSet], "typeName");
        uidInfo.attributes = newAttributes
        console.log(uidInfo.attributes)

        let resp = await razorCall(`/Asset/${uid}`,{
            method: "PUT",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/text',
            },
            body: JSON.stringify({uidInfo})

        })
        console.log(await resp)
        // console.log(await resp.json())
        if(await !resp.ok){
            let data = [{ UID: uid, Reason: `ERROR: ${resp.status}, ${resp.statusText}` }]
            addToFailList.writeRecords(data)
            .then(() => {
                console.log('Data written to CSV file successfully.');
            })
            .catch(err => {
                console.error('Error writing to CSV file:', err);
            });
        }

    }else{
        console.log("Doesn't includes")
        // this asset isn't log it in the error output

    }

  }}