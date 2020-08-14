const ical = require('node-ical'); // ical (.ics) file parser

const utils = require('../utils');
const Collecte = require('../classes/Collecte');

const CONNECTOR_NAME = "vdl";
const VDL_START_URL = "https://www.vdl.lu/fr/vivre/domicile-au-quotidien/collecter-et-trier-ses-dechets/calendrier-des-collectes-new/";
const VDSL_END_URL = "/all/ical.ics";
const DOWNLOAD_TEMPO = 800; // milliseconds
let MAX_VDL = 798; // 798 As found on https://www.vdl.lu/fr/vivre/domicile-au-quotidien/collecter-et-trier-ses-dechets/calendrier-des-collectes/ . TODO: Fetch this value dynamically


// | API Type | VDL                  | Sidec              | 
// |----------|----------------------|--------------------|
// | BULKY    |                      | encombrants        |
// | GLASS    | Verre                | verre              |
// | ORGANIC  | Déchets alimentaires | dechets organiques |
// | PAPER    | Papier/Carton        | papiers cartons    |
// | PMC      | Emballages Valorlux  |                    |
// | RESIDUAL | Déchets résiduels    | dechets menagers   |

const wasteMapping = {
    "Verre": "GLASS",
    "Déchets alimentaires": "ORGANIC",
    "Papier/Carton": "PAPER",
    "Déchets résiduels": "RESIDUAL",
    "Emballages Valorlux": "PMC"
}


module.exports.getVdlCalendarUrl = getVdlCalendarUrl;
function getVdlCalendarUrl(c) {
    return VDL_START_URL + c + VDSL_END_URL;
}


module.exports.getContent = async function getContent(mode) {

    let index = 0;
    let url;
    let collecteList = [];

    // collecteList.push("PLOP");


    if (mode == utils.MODE_OFFLINE) {
        console.debug("[VDL.getContent] Offline mode not supported. Limiting results to 1 calendar.");
        MAX_VDL = 1;
    } else {
        console.debug("[VDL.getContent] Start parsing online file");
    }


    try {

        do {
            index += 1;
            collecteList = await parseVdlContent(getVdlCalendarUrl(index), collecteList);
            await new Promise(r => setTimeout(r, Math.random() * DOWNLOAD_TEMPO)); // Bypass http request rate protection from target web hosting
        } while (index < MAX_VDL);

    } catch (err) {
        throw new Error("[VDL.getContent] " + err.toString());
    }

    // Sanity check
    // if (collecteList.length === 0) throw new Error("[VDL.getContent] Got empty results from parsing. Something went certainly wrong");

    return { 'name': CONNECTOR_NAME, 'collecteList':collecteList };
}



// Calendar file parser
async function parseVdlContent(url, collecteList) {
    console.debug("[VDL] Fetching : " + url);

    ical.async.fromURL(url, {}, function (err, data) {
        if (err) {
            throw new Error("[VDL.parseVdlContent] " + err.toString());
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
                        streetNumbers = ev.location.substr(streetNumbersIndex + 3, ev.location.length); // Extract street numbers to another variable
                        ev.location = ev.location.substr(0, streetNumbersIndex); // Remove street numbers from location field
                    }

                    let tmpCodePostal = utils.getPostalCodesByCityAndStreetName('Luxembourg',  ev.location);

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
