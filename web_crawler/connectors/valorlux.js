const got = require('got');
const fs = require('fs');

const utils = require('../utils');
const Collecte = require('../classes/Collecte');

// This connector is simply reading the complete valorlux calendar from a single json available to public
// They use it for they own website and can be queried from any client. Thanks valorlux :)


// Library limitations
// Esch-sur-Alzette : cannot distinguish TourA and TourB
// Differdange : cannot distinguish A, B, C ,D
// Dudelange : cannot distinguish Tournée de Lundi, Mardi, Mercredi ...
// Luxembourg : cannot distinguish Tour 1 to 13 (but already retrieved  from vdl.lu)

// To FIX
// Pétange : must split between Pétange and Rodange/Lamadelaine
// Walferdange : merge '2' and '3'

// Potential data sources
// - https://calendar.valorlux.lu/ (html and pdf)
// - https://www.valorlux.lu/fr/pwa?collect_action=downloadics&force=1&city=Mersch (ics)
// - https://www.valorlux.lu/manager/mod/valorlux/valorlux/cities (json)
// - https://www.valorlux.lu/manager/mod/valorlux/valorlux/addresses (json)
// - https://www.valorlux.lu/manager/mod/valorlux/valorlux/all (json)

const CONNECTOR_NAME = "valorlux";
const ALL_URL = "https://www.valorlux.lu/manager/mod/valorlux/valorlux/all";
const VALORLUX_TYPE = "PMC";

const BLOCKLIST = ['Esch-sur-Alzette', 'Differdange', 'Dudelange', 'Luxembourg', 'Pétange', 'Walferdange'];
const ALLOWLIST = []; // To limit results (testing)


module.exports.getContent = async function getContent(mode) {

     if (mode == utils.MODE_OFFLINE) {        
        console.debug("[VALORLUX.getContent] Start parsing offline file");
        try {            
            let file = fs.readFileSync('./data/valorlux_all.json');
            let data = JSON.parse(file)
            // TODO : add some syntax check to ensure the JSON is matching the expected format                           
            return parseValorluxContent(data);
        } catch (err) {
            throw new Error("[VALORLUX.getContent] " + err.toString());
        }
    } else {
        console.debug("[VALORLUX.getContent] Start parsing online file");
        try {
            let res = await got(ALL_URL);
            let data = JSON.parse(res.body);
            // TODO : add some syntax check to ensure the JSON is matching the expected format 
            return parseValorluxContent(data);
        } catch (err) {
            throw new Error("[VALORLUX.getContent] " + err.toString());
        }
    }

}

module.exports.parseContent = parseValorluxContent;
function parseValorluxContent(data) {

    let collecteList = [];

    for (c in data.cities) {

        // Filter by blocklist and allowlist
        if (BLOCKLIST.indexOf(c) === -1 && (ALLOWLIST.length === 0 || ALLOWLIST.indexOf(c) !== -1)) {

            // Ignore when multiple "calendars" are specified (note: should already be filtered out with BLOCKLIST)
            let dates = utils.first(data.cities[c]);

            for (d in dates) {
                let str = dates[d].split("/");

                // As the output must be "postal code centric", let's duplicate calendar entries for each postal code of the given commune
                for (cp of utils.getPostalCodesByCityName(c)) {
                    let clt = new Collecte("", new Date(str[1] + "/" + str[0] + "/" + str[2]).valueOf(), c, "", "", cp, VALORLUX_TYPE);
                    collecteList.push(clt);
                }
            }
        }
    }
    console.debug("[VALORLUX] Collecte entries: " + collecteList.length);

     // Sanity check
     if (collecteList.length === 0) throw new Error("[VALORLUX.parseValorluxContent] Got empty results from parsing. Something went certainly wrong");

     return { 'name': CONNECTOR_NAME, 'collecteList':collecteList };
}
