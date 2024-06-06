import { razorCall } from "./apicalls.js";
import { parseAttributeMapping, parseUIDList } from "./csvProcesses.js";
const attributeMapping = parseAttributeMapping("./CSVs/Attributemapping.csv", (json) => {
    console.log(JSON.stringify(json, null, 2));
});
const UidList = parseUIDList('./CSVs/UIDlist.csv');
  console.log(JSON.stringify(json, null, 2)); // logs UID list
 