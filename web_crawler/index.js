const https = require('https');
const fs = require('fs');

const utils = require('./utils');
const caclr = require('./caclr/caclr');

const vdl = require('./sources/vdl');
const sidec = require('./sources/sidec');
const valorlux = require('./sources/valorlux');

const datetimestamp = utils.initDatetimestamp(); 
let addressList = []; 
let postalCodesList = [];

////////// Utility functions
// Supposed to delete temporary content
var cleanup = function () {
    fs.mkdir(`output/${datetimestamp}`, { recursive: true }, (err) => {
        if (err) throw err;
    });
}
// Export content in a single file
var writeFile = function (cc, dest, callback) {
    let json = JSON.stringify(cc, null, 2);
    fs.writeFile(`output/${datetimestamp}/${dest}`, json, 'utf8', callback);
}
// Export crawled content in multiple files for each postal code.
function writeByPostalCode(arg) {
    for (p of postalCodesList) {
        let tmpCollecte = arg.filter(arg => arg.codepostal === p);
        if (tmpCollecte.length != 0) {            
            // Sort events by date and dump files for offline processing
            writeFile(tmpCollecte.sort((e1,e2) => utils.sortByDate(e1.event_date,e2.event_date))), `${p}.json`, function() {});             
            console.log(`[APP] Writing ${p}.json`);
        }         
    }
}


///// Main
async function app() {
    cleanup();
    
    addressList = await caclr.getAddresses();       

    // Extracting list of unique of postal codes. TODO: magic line :) 
    postalCodesList = [...new Set(addressList.map(x => x.CodePostal))];    

    let vdlList = [];
    // vdlList = await vdl.download(addressList);   
     
    let sidecList = [];
    // sidecList = await sidec.download(addressList);   
   
    let valorluxList = [];
    // valorluxList = await valorlux.download(addressList);   
    
    let fullList = vdlList.concat(sidecList).concat(valorluxList);
    // let fullList = JSON.parse(fs.readFileSync('./output/full.json'));

    console.log("[APP] Start writing files to output/"+datetimestamp+" folder");
    writeByPostalCode(fullList);

    // Dump files for offline processing
    writeFile(addressList, `caclr.json`, function() {}); 
    // Sort events by date and dump complete repositories for offline processing
    writeFile(sidecList.sort((e1,e2) => utils.sortByDate(e1.event_date,e2.event_date))), `sidec.json`, function () { });    
    writeFile(vdlList.sort((e1,e2) => utils.sortByDate(e1.event_date,e2.event_date))), `vdl.json`, function () { });
    writeFile(valorluxList.sort((e1,e2) => utils.sortByDate(e1.event_date,e2.event_date)), `valorlux.json`, function () { });
}

app();




