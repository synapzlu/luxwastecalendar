const cheerio = require('cheerio');
const got = require('got');

const utils = require('../utils');
const Collecte = require('../classes/Collecte');


// This SIDEC connector is using basic HTML parsing techniques using cheerio library.
// All pages are loaded one by one, then we parse each month table and then extract waste pickup events from image file name
// For example, "caption-dechets_menagers-16.gif" in the 3rd table means a RESIDUAL pickup on the 16th of March.


const CONNECTOR_NAME = "sidec";
const sidecUrl = 'https://sidec.lu/fr/Collectes/Calendrier';
const yearUrlParam = "annee=";
const communeUrlParam = "myCommune=";
// Introduced the startupFullUrl because a call on sidecUrl was not directing the full calendar list anymore
const startupFullUrl = "https://www.sidec.lu/fr/Collectes/Calendrier?annee=2022&myCommune=2611"; 

const YEAR = 2022;

// !! Bug in Sidec html source code : GLASS and ORGANIC are inverted !!

// | API Type | VDL                  | Sidec              | 
// |----------|----------------------|--------------------|
// | BULKY    |                      | encombrants        |
// | GLASS    | Verre                | dechets organiques |
// | ORGANIC  | Déchets alimentaires | verre              |
// | PAPER    | Papier/Carton        | papiers cartons    |
// | PMC      | Emballages Valorlux  |                    |
// | RESIDUAL | Déchets résiduels    | dechets menagers   |




const wasteMapping = {
    "encombrants": "BULKY",
    "verre": "ORGANIC",
    "dechets organiques": "GLASS",
    "papiers cartons": "PAPER",
    "dechets menagers": "RESIDUAL"
}

module.exports.getCommuneUrl = getCommuneUrl;
function getCommuneUrl(y, c) {
    let fullUrl = sidecUrl + "?" + yearUrlParam + y + "&" + communeUrlParam + c;
    return fullUrl;
}

async function loadHtmlContent(url) {
    try {
        let res = await got(url);
        return $ = cheerio.load(res.body, {
            normalizeWhitespace: true
        });
    } catch (err) { throw new Error("[SIDEC.loadHtmlContent]" + err.toString()); }
}

module.exports.extractTypes = extractTypes;
function extractTypes(itemType) {
    // Assomption : no more than 2 items in the same type

    // Samples :
    // verre
    // encombrants verre => ['encombrants', 'verre']
    // encombrants dechets menagers => ['encombrants', 'dechets menagers']
    // dechets menagers verre = > ['dechets menagers', 'verre']
    // dechets menagers papiers cartons => ['dechets menagers', 'papiers cartons']

    let types = [];
    let lastIndex = 0;


    // Loop 1     
    let firstIndex = itemType.indexOf(" ");
    let secondIndex = itemType.indexOf(" ", (firstIndex + 1));

    if (wasteMapping[itemType.substring(0, firstIndex)]) {
        types.push(wasteMapping[itemType.substring(0, firstIndex)]);
        lastIndex = firstIndex + 1;

    } else if (wasteMapping[itemType.substring(0, secondIndex)]) {
        types.push(wasteMapping[itemType.substring(0, secondIndex)]);
        lastIndex = secondIndex + 1;
    }

    // Loop 2 
    firstIndex = itemType.indexOf(" ", lastIndex);
    if (firstIndex = itemType.lastIndexOf(" ")) { secondIndex = itemType.lenght; }

    if (wasteMapping[itemType.substring(lastIndex, firstIndex)]) {
        types.push(wasteMapping[itemType.substring(lastIndex, firstIndex)]);

    } else if (wasteMapping[itemType.substring(lastIndex, secondIndex)]) {
        types.push(wasteMapping[itemType.substring(lastIndex, secondIndex)]);
    }
    return types;
}




module.exports.getContent = getContent;
async function getContent(mode) {

    // return new Promise(function (resolve, reject) {

    let collecteList = [];
    let calendarList = [];
    let $;

    try { $ = await loadHtmlContent(sidecUrl); } catch (err) { throw new Error("[SIDEC.getContent]" + err.toString()); }

    // First, let's retrieve all calendars ID and associated cities
    $('#getcalendar > select > option').each((index, element) => {
        if ($(element).attr("value")) {
            calendarList.push({ id: $(element).attr("value"), commune: $(element).text().trim() });
        }
    });

    // Sanity check
    if (calendarList.length < 1) throw new Error("Got empty calendar list from sidec.lu");


    if (mode == utils.MODE_OFFLINE) {
        console.debug("[SIDEC.getContent] Cannot parse offline files, but let's limit to 1 online city");
        calendarList = calendarList.slice(0, 1);
    } else {
        console.debug("[SIDEC.getContent] Start parsing online website");
    }

    collecteList = await parseSidecContent(calendarList);

    return { 'name': CONNECTOR_NAME, 'collecteList':collecteList };
}




module.exports.parseContent = parseSidecContent;
async function parseSidecContent(calendarList) {

    let collecteList = [];

    // Then we query all calendars
    for (c of calendarList) {

        let tmpCodePostal = utils.getPostalCodesByCityName(c.commune);

        // Query the specific calendar ID
        let fullUrl = getCommuneUrl(YEAR, c.id);

        console.debug("[SIDEC] Fetching: " + fullUrl);

        let $;
        try { $ = await loadHtmlContent(fullUrl); } catch (err) { throw new Error("[SIDEC.parseSidecContent]" + err.toString()); }

          // Read the html source and iterate over each month
        $('#col-2 .calendar').each((index, element) => {

            let month = (index + 1);

            // Read each img parameter
            $(element).find($('.calendar-day img')).each((index2, element2) => {

                let item = $(element2).attr("src"); // /extension/sidec/design/sidec/images/calendar/caption-dechets_menagers/caption-dechets_menagers-16.gif 
                item = item.substring(item.lastIndexOf("caption-") + 8, item.lastIndexOf(".")); // extract the interesting part, eg. "dechets_menagers-16" 

                let itemDate = new Date(month + "/" + item.substring(item.lastIndexOf("-") + 1, item.length) + "/" + YEAR); // MM/DD/YYYY
                let itemTypes = [];

                itemTypes = extractTypes(item.substring(0, item.lastIndexOf("-")).replace(/_/g, " "));

                // Iterate if multiple types have been found on the same day
                for (type of itemTypes) {

                    // As the output must be "postal code centric", let's duplicate calendar entries for each postal code of the given commune
                    for (cp of tmpCodePostal) {
                        let clt = new Collecte("", itemDate.valueOf(), c.commune, "", "", cp, type);
                        collecteList.push(clt);
                    }

                }
            });
        });

        console.debug("[SIDEC] Collectes entries :" + collecteList.length);
    }

    // Sanity check
    if (collecteList.length === 0) throw new Error("[SIDEC.parseSidecContent] Got empty results from parsing. Something went certainly wrong");

    return collecteList;
}
