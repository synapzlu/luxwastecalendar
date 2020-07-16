const https = require('https');
const fs = require('fs');
const ical = require('node-ical'); // ical (.ics) file parser
const fixy = require('fixy'); // Fixed width column parser

// const Address = require('./classes/Address');
const Collecte = require('./classes/Collecte');

let collecteList = [];
let addressList = []; 
let postalCodesList = [];

const MAX_VDL = 100; // 798 As found on https://www.vdl.lu/fr/vivre/domicile-au-quotidien/collecter-et-trier-ses-dechets/calendrier-des-collectes/


////////// Utility functions
var cleanup = function () {
    fs.mkdir(`output/${datetimestamp}`, { recursive: true }, (err) => {
        if (err) throw err;
    });
}
var writeFile = function (cc, dest, callback) {
    let json = JSON.stringify(cc, null, 2);
    fs.writeFile(`output/${datetimestamp}/${dest}`, json, 'utf8', callback);
}
var sleep = function (ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
var sortByDate = function (a, b) {
    // Use toUpperCase() to ignore character casing
    const dateA = new Date(a.event_date);
    const dateB = new Date(b.event_date);

    let comparison = 0;
    if (dateA > dateB) {
        comparison = 1;
    } else if (dateA < dateB) {
        comparison = -1;
    }
    return comparison;
}
var initDatetimestamp = function () {
    let today = new Date();
    let sToday = today.getDate().toString();
    sToday += (today.getMonth() + 1).toString();
    sToday += today.getFullYear().toString();
    sToday += today.getHours().toString();
    sToday += today.getMinutes().toString();
    sToday += today.getSeconds().toString();
    return sToday;
}
const datetimestamp = initDatetimestamp(); 



//////////// Address functions
async function getAddresses() {
    return new Promise(function (resolve, reject) {
        let tempList = [];       
        
        // TODO : download new version at runtime
        let file = fs.readFileSync('./caclr/TR.DICACOLO.RUCP', 'binary'); // Source enconding is CP-1252 but 'binary' seems to work also
        var rawList = fixy.parse({
            map: [{
                name: "Canton",
                width: 40,
                start: 1,
                type: "string"
            }, {
                name: "District",
                width: 40,
                start: 41,
                type: "string"
            }, {
                name: "Commune",
                width: 40,
                start: 81,
                type: "string"
            }, {
                name: "Localite",
                width: 40,
                start: 121,
                type: "string"
            }, {
                name: "Rue",
                width: 40,
                start: 161,
                type: "string"
            }, {
                name: "CodePostal",
                width: 40,
                start: 201,
                type: "int"
            }],
            options: {
                fullwidth: 205,
                skiplines: null,
                format: "json"
            }
        }, file);

        // for (key in rawList) {
        //     tempList.push(new Address(rawList[key].Canton, rawList[key].District, rawList[key].Commune, rawList[key].Localite, rawList[key].Rue, rawList[key].CodePostal));
        // };


        // Extracting list of unique of postal codes
        postalCodesList = [...new Set(rawList.map(x => x.CodePostal))]; // TOOD: understand this magic line

        // Dump files for offline processing
        writeFile(rawList, `caclr.json`, function() {}); 

        // successfully fill promise
        resolve(rawList); 
        
    })
}


//////////// VDL specific functions
async function vdl_download() {
    let index = 0;
    let url;
    do {
        index += 1;
        url = `https://www.vdl.lu/fr/vivre/domicile-au-quotidien/collecter-et-trier-ses-dechets/calendrier-des-collectes-new/${index}/all/ical.ics`;
        vdl_icsParse(url);
        await sleep(Math.random() * 500); // Bypass http request rate protection from target web hosting
    } while (index < MAX_VDL);
    
    // Sort events by date and dump complete VDL repository for offline processing
    writeFile(collecteList.sort(sortByDate), `VDL.json`, function () { });
    
    writeByPostalCode();
}

function vdl_icsParse(url) {
    console.log(url);
    ical.async.fromURL(url, {}, function (err, data) {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        for (let k in data) {
            if (data.hasOwnProperty(k)) {
                const ev = data[k];
                if (data[k].type == 'VEVENT') {
                    // Clean up the source as all location fields (street names) have a "Luxembourg" suffix
                    ev.location = ev.location.substr(0, ev.location.lastIndexOf(" "));  

                    // Reverse search for codepostal based on street name
                    // As we want to use codepostal and primary key for output files, we'll ignore the street number ranges in reverse search and mapping
                    // But we'll extract the street numbers to store them explicitely
                    // e.g. "Rue Laurent Menager - 49-151, 50-162"
                    let streetNumbersIndex = ev.location.lastIndexOf(" - ");
                    let streetNumbers = -1;

                    if (streetNumbersIndex > 0) {
                        streetNumbers = ev.location.substr(streetNumbersIndex+3, ev.location.length); // Extract street numbers to another variable
                        ev.location = ev.location.substr(0, streetNumbersIndex); // Remove street numbers from field
                    }

                    let tmpcodepostal = addressList.find(addr => addr.Localite === 'Luxembourg' && addr.Rue === ev.location);                    
                    
                    // Replace by -1 if Address was not found in addressList or if found with a null value
                    if (tmpcodepostal && Number.isInteger(tmpcodepostal.CodePostal)) {
                        tmpcodepostal = tmpcodepostal.CodePostal;
                    } else {
                        tmpcodepostal = -1;
                        console.debug("Postal code not found for " + ev.location);
                    }

                    collecteList.push(new Collecte(ev.uid, ev.start, "Luxembourg", ev.location, streetNumbers, tmpcodepostal, ev.summary));
                }
            }
        }
    });
}


// Main output
function writeByPostalCode() {
    for (p of postalCodesList) {

        let tmpcollecte = collecteList.filter(collecteList => collecteList.codepostal === p);

        if (tmpcollecte.length != 0) {
            
            // Sort events by date and dump files for offline processing
            writeFile(tmpcollecte.sort(sortByDate), `${p}.json`, function() {}); 
            
            console.log(p);
        }

         
    }
}



///// Main
async function app() {
    cleanup();
    addressList = await getAddresses();
    console.log("Address list size:" + addressList.length);
    vdl_download();
    //writeFile(addressList, 'plop.json', function() {});    
}

app();




