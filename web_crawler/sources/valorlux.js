const got = require('got');
const fs = require('fs');

const Collecte = require('../classes/Collecte');

// Potential data sources
// - https://calendar.valorlux.lu/ (html and pdf)
// - https://www.valorlux.lu/fr/pwa?collect_action=downloadics&force=1&city=Mersch (ics)
// - https://www.valorlux.lu/manager/mod/valorlux/valorlux/cities (json)
// - https://www.valorlux.lu/manager/mod/valorlux/valorlux/addresses (json)
// - https://www.valorlux.lu/manager/mod/valorlux/valorlux/all (json)


const ALL_URL = "https://www.valorlux.lu/manager/mod/valorlux/valorlux/all";
const VALORLUX_TYPE = "PMC";

// Limitations
// Esch-sur-Alzette : cannot distinguish TourA and TourB
// Differdange : cannot distinguish A, B, C ,D
// Dudelange : cannot distinguish Tournée de Lundi, Mardi, Mercredi ...
// Luxembourg : cannot distinguish Tour 1 to 13 (but already retrieved  from vdl.lu)

// To FIX
// Pétange : must split between Pétange and Rodange/Lamadelaine
// Walferdange : merge '2' and '3'


const BLOCKLIST = ['Esch-sur-Alzette', 'Differdange', 'Dudelange', 'Luxembourg', 'Pétange', 'Walferdange'];
const ALLOWLIST = []; // To limit results (testing)


function first(p) {
    for (let i in p) return p[i];
}

function getPostalCodesByCityName(addressList, city) {
    // Search on Commune level
    let tmpCodePostal = addressList.filter(addressList => addressList.Commune === city);
    tmpCodePostal = [...new Set(tmpCodePostal.map(x => x.CodePostal))]; // Remove duplicates

    // If nothing found on Commune level, let's try to search on Localité level
    if (tmpCodePostal.length === 0) {    
        tmpCodePostal = addressList.filter(addressList => addressList.Localite === city);
        tmpCodePostal = [...new Set(tmpCodePostal.map(x => x.CodePostal))]; // Remove duplicates
    }

    if (tmpCodePostal.length === 0)
        console.error("[VALORLUX] Postal codes not found for " + city)

    return tmpCodePostal
}

async function download(addressList) {

    let collecteList = [];

    // First we have to retrieve all supported communes and their sidec ID

    // Fetch from website
    const response = await got(ALL_URL);
    let data = JSON.parse(response.body);
    // Fetch from local storage
    // let data = JSON.parse(fs.readFileSync('./sources/valorlux_all.json'));

    for (c in data.cities) {

        // Filter by blocklist
        if (BLOCKLIST.indexOf(c) === -1 && (ALLOWLIST.length === 0 || ALLOWLIST.indexOf(c) !== -1)) {

            // Ignore when multiple "calendars" are specified (note: should already be filtered out with BLOCKLIST)
            let dates = first(data.cities[c]);

            // data fix for cities which is not spelled the same on valorlux.lu and in Caclr database
            if (c === "Lac de la Haute Sûre") c = "Lac de la Haute-Sûre";
            if (c === "Diekrich") c = "Diekirch";       
            
            for (d in dates) {
                let str = dates[d].split("/");
               
                // As the output must be "postal code centric", let's duplicate calendar entries for each postal code of the given commune
                for (cp of getPostalCodesByCityName(addressList, c)) {          
                    let clt = new Collecte("", new Date(str[1]+"/"+str[0]+"/"+str[2]).valueOf(), c, "", "", cp,  VALORLUX_TYPE);
                    collecteList.push(clt);
                }
            }   
        }
    }
    console.debug("[VALORLUX] Collecte entries: "+ collecteList.length);
    return collecteList;
}

module.exports.download = function (addressList) {
    return download(addressList);
}
