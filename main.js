import { razorCall } from "./apicalls.js";
import { parseAttributeMapping, parseUIDList } from "./csvProcesses.js";

const attributeMappingPromise = parseAttributeMapping("./CSVs/Attributemapping.csv");
const uidListPromise = parseUIDList('./CSVs/UIDlist.csv');
const [attributeMapping, uidList] = await Promise.all([attributeMappingPromise, uidListPromise]);
for (const uid of uidList) {
    let uidInfo = await razorCall(`/Asset/${uid}`,{})
    if(attributeMapping.hasOwnProperty(uidInfo.attributeSet) ){
        console.log("Includes")
        // this asset has the an attribute set that is in the mapping csv now update the information
        
    }else{
        console.log("Doesn't includes")
        // this asset isn't log it in the error output

    }

  }