const vdl = require('./connectors/vdl');
const sidec = require('./connectors/sidec');
const valorlux = require('./connectors/valorlux');
const utils = require('./utils');
const files = require('./files');

const datetimestamp = utils.initDatetimestamp();


// Entry point
var myArgs = process.argv.slice(2);
switch (myArgs[0]) {
  case 'dryrun':
    console.log("[APP] Starting in DRYRUN mode");
    main(utils.DRYRUN);
    break;
  case 'offline':
    console.log("[APP] Starting in OFFLINE mode");
    main(utils.MODE_OFFLINE);
    break;
  default:
    main();
}




// Main loop
function main(mode) {
  Promise.all([
    sidec.getContent(mode),
    valorlux.getContent(mode),
    vdl.getContent(mode)
  ]).then((res) => writeIndividualFiles(res), errHandler)
  .then((res) => mergeFiles(res), errHandler)
  .then((res) => writeFiles(res), errHandler)
  .then(console.log(`[APP] Process complete. Output files can be found in : output/${datetimestamp} folder`));
}





//// Content handlers

// Write content of each connector into individual files
var writeIndividualFiles = (data) => {
  let sumList = [];
  for (d of data) {
      files.writeFile(d.collecteList, datetimestamp, `${d.name}.json`);
  }
  return data;
};
// Merge all content into a single array
var mergeFiles = (data) => {
  let sumList = [];
  for (d of data) {
    sumList = sumList.concat(d.collecteList);
  }
  return sumList;
};
// Write merged content and by postal code to files
var writeFiles = (data) => { 
  files.writeFile(data, datetimestamp, `all.json`);
  files.writeByPostalCode(data, datetimestamp);
 };


// Async error handler
 var errHandler = function (err) {
  console.error(err);
}