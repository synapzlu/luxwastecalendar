const https = require('https');
const fs = require('fs');
const ical = require('node-ical'); // ical (.ics) file parser
const fixy = require('fixy'); // Fixed width column parser

const Address = require('./classes/Address');
const Collecte = require('./classes/Collecte');

var collecteList = [];
var addressList = []; 

const MAX_VDL = 798; // 798 As found on https://www.vdl.lu/fr/vivre/domicile-au-quotidien/collecter-et-trier-ses-dechets/calendrier-des-collectes/


////////// Utility functions
var cleanup = function () {
    fs.mkdir('tmp/', { recursive: true }, (err) => {
        if (err) throw err;
    });
}
var writeFile = function (cc, dest, callback) {
    let json = JSON.stringify(cc);
    fs.writeFile(dest, json, 'utf8', callback);
}
var sleep = function (ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
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
        let file = fs.readFileSync('./caclr/TR.DICACOLO.RUCP', 'UTF-8');
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
        
        writeFile(rawList, `tmp/caclr_${datetimestamp}.json`, function() {}); // Dump files for offline processing

        resolve(rawList); // successfully fill promise
        
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
    writeFile(collecteList, `tmp/VDL_${datetimestamp}.json`, function () { });
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
                    let tmplocation = ev.location.substr(0, ev.location.lastIndexOf(" "));  

                    // Reverse search for codepostal based on street name
                    let tmpcodepostal = addressList.find(addr => addr.Localite === 'Luxembourg' && addr.Rue === tmplocation);

                    // Replace by -1 if Address was not found in addressList or if found with a null value
                    if (tmpcodepostal && Number.isInteger(tmpcodepostal.CodePostal)) {
                        tmpcodepostal = tmpcodepostal.CodePostal;
                    } else {
                        tmpcodepostal = -1;
                        console.debug("CodePostal not found for " + tmplocation);
                    }

                    collecteList.push(new Collecte(ev.uid, ev.start, "Luxembourg", tmplocation, tmpcodepostal, ev.summary));
                }
            }
        }
    });
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




