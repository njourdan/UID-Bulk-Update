import _ from 'lodash'
import { razorCall } from "./apicalls.js";
import { parseAttributeMapping, parseUIDList, addToFailList } from "./csvProcesses.js";
import Bottleneck from "bottleneck"
import requestPromise from 'request-promise';

async function processData(){
const attributeMappingPromise = parseAttributeMapping("./CSVs/Attributemapping.csv");
const uidListPromise = parseUIDList('./CSVs/UIDlist.csv');
const [attributeMapping, uidList] = await Promise.all([attributeMappingPromise, uidListPromise]);

const limiter = new Bottleneck({
    maxConcurrent: 1,
    minTime: 200,
    reservoir: 5, // Initial number of requests
    reservoirIncreaseAmount: 1,
    reservoirIncreaseInterval: 1000, // Add one request every second
    reservoirIncreaseMaximum: 5, // Maximum reservoir size
});

const limitedRazorCall = limiter.wrap(razorCall);

for (let uid of uidList) {

    uid = uid.replace("/r","")
    let res = await limitedRazorCall(`Asset/${uid}`,{})
    if(!res.ok){
        let data = [{ UID: uid, Reason: `ERROR: Couldn't request` }]
        addToFailList.writeRecords(data)
        continue
    }
    let uidInfo =await res.json()
    if(attributeMapping.hasOwnProperty(uidInfo.attributeSet)){
        let newAttributes = _.unionBy(uidInfo.attributes, attributeMapping[uidInfo.attributeSet], "typeName");
        uidInfo.attributes = newAttributes

        let resp = await limitedRazorCall(`Asset/${uid}`,{
            method: "PUT",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(uidInfo)

        })
        console.log(`put request status:${resp.status}`)
        console.log(`put request status text:${resp.statusText}`)
        if(!resp.ok){
            addToFailList.writeRecords([{ UID: uid, Reason: `${resp.status} ${uidInfo.attributeSet} ${resp.title}` }])
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

    }

  }
}
processData();