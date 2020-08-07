const ical = require('node-ical'); // ical (.ics) file parser

const Collecte = require('../classes/Collecte');

const VDL_START_URL = "https://www.vdl.lu/fr/vivre/domicile-au-quotidien/collecter-et-trier-ses-dechets/calendrier-des-collectes-new/";
const VDSL_END_URL = "/all/ical.ics";
const DOWNLOAD_TEMPO = 1000; // milliseconds
const MAX_VDL = 798; // 798 As found on https://www.vdl.lu/fr/vivre/domicile-au-quotidien/collecter-et-trier-ses-dechets/calendrier-des-collectes/ . TODO: Fetch this value dynamically


// | API Type | VDL                  | Sidec              | 
// |----------|----------------------|--------------------|
// | BULKY    |                      | encombrants        |
// | GLASS    | Verre                | verre              |
// | ORGANIC  | Déchets alimentaires | dechets organiques |
// | PAPER    | Papier/Carton        | papiers cartons    |
// | PMC      | Emballages Valorlux  |                    |
// | RESIDUAL | Déchets résiduels    | dechets menagers   |

const wasteMapping = {
    "Verre" : "GLASS",
    "Déchets alimentaires" : "ORGANIC",
    "Papier/Carton" : "PAPER",
    "Déchets résiduels" : "RESIDUAL",
    "Emballages Valorlux" : "PMC"
  }

async function download(addressList) {   
    let index = 0;
    let url;
    let collecteList = [];
    do {
        index += 1;
        url = VDL_START_URL+index+VDSL_END_URL;
        collecteList = vdl_icsParse(url, addressList, collecteList);        
        await sleep(Math.random() * DOWNLOAD_TEMPO); // Bypass http request rate protection from target web hosting
    } while (index < MAX_VDL);

    return collecteList;
}



// Calendar file parser
function vdl_icsParse(url, addressList, collecteList) {
    console.debug("[VDL] Fetching : "+url);

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
                        ev.location = ev.location.substr(0, streetNumbersIndex); // Remove street numbers from location field
                    }

                    let tmpCodePostal = addressList.find(addr => addr.Localite === 'Luxembourg' && addr.Rue === ev.location);                    
                    
                    // Replace by -1 if Address was not found in addressList or if found with a null value
                    if (tmpCodePostal && Number.isInteger(tmpCodePostal.CodePostal)) {
                        tmpCodePostal = tmpCodePostal.CodePostal;
                    } else {
                        tmpCodePostal = -1;
                        console.debug("[VDL] Postal code not found for " + ev.location);
                    }
                    collecteList.push(new Collecte(ev.uid, ev.start.valueOf(), "Luxembourg", ev.location, streetNumbers, tmpCodePostal, wasteMapping[ev.summary]));
                }
            }
        }
    });

    return collecteList;
}



// Utility sleep function
var sleep = function (ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}


module.exports.download = function (addressList) {
    return download(addressList);
  }