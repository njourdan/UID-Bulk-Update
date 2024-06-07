import _ from 'lodash'
import { razorCall } from "./apicalls.js";
import { parseAttributeMapping, parseUIDList, addToFailList } from "./csvProcesses.js";

const attributeMappingPromise = parseAttributeMapping("./CSVs/Attributemapping.csv");
const uidListPromise = parseUIDList('./CSVs/UIDlist.csv');
const [attributeMapping, uidList] = await Promise.all([attributeMappingPromise, uidListPromise]);
for (const uid of uidList) {
    console.log(uid)
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
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({uidInfo})

        })
        console.log(await resp.json())
        if(!resp.ok){
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
        addToFailList.writeRecords([{ UID: uid, Reason: `ERROR: not in Mapping` }])
        // this asset isn't log it in the error output

    }

  }