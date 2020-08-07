const cheerio = require('cheerio');
const got = require('got');

const Collecte = require('../classes/Collecte');

const sidecUrl = 'http://sidec.lu/fr/Collectes/Calendrier';
const yearUrlParam = "annee=";
const communeUrlParam = "myCommune=";

const YEAR = 2020;


// | API Type | VDL                  | Sidec              | 
// |----------|----------------------|--------------------|
// | BULKY    |                      | encombrants        |
// | GLASS    | Verre                | verre              |
// | ORGANIC  | Déchets alimentaires | dechets organiques |
// | PAPER    | Papier/Carton        | papiers cartons    |
// | PMC      | Emballages Valorlux  |                    |
// | RESIDUAL | Déchets résiduels    | dechets menagers   |

const wasteMapping = {
  "encombrants" : "BULKY",
  "verre" : "GLASS",
  "dechets organiques" : "ORGANIC",
  "papiers cartons" : "PAPER",
  "dechets menagers" : "RESIDUAL"
}


function getCommuneUrl(y, c) {
  let fullUrl = sidecUrl+"?"+yearUrlParam+y+"&"+communeUrlParam+c;
  return fullUrl;
}


function extractTypes(itemType) {
  // Assomption : no more than 2 items in the same type

  // Samples :
  // verre
  // encombrants verre => encombrants verre
  // encombrants dechets menagers => encombrants + dechets menagers
  // dechets menagers verre = > dechets menagers + verre
  // dechets menagers papiers cartons => dechets menagers + papiers cartons

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


async function download(addressList) {

  let collecteList = [];

  // First we have to retrieve all supported communes and their sidec ID
  const response = await got(sidecUrl);
  const $ = cheerio.load(response.body, {
    normalizeWhitespace: true
  });

  let calendarList = [];
  // First, let's retrieve all calendars ID and associated cities
  $('#getcalendar > select > option').each((index, element) => {
    if ($(element).attr("value")) {
      calendarList.push({ id: $(element).attr("value"), commune: $(element).text().trim() });
    }
  });
  // calendarList.push({ id: 1614, commune: "Erpeldange-sur-Sûre"}); // for test
  // console.debug("[SIDEC] Number of calendars found in sidec.lu :" + calendarList.length);

  // Then we query all calendars
  for (c of calendarList) {

    // data fix for "Lac de la Haute-Sûre" which is not spelled the same on sidec.lu and in Caclr database
    if (c.commune === "Lac Haute Sûre") c.commune = "Lac de la Haute-Sûre";

    let tmpCodePostal = addressList.filter(addr => addr.Commune === c.commune);
    tmpCodePostal = [...new Set(tmpCodePostal.map(x => x.CodePostal))];

    console.debug("[SIDEC] Number of postal code for " + c.commune + ": " + tmpCodePostal.length);  
    if (tmpCodePostal.length === 0)
      console.error("[SIDEC] Postal codes not found for " + c)
    

    // Query the specific calendar ID
    let fullUrl = getCommuneUrl(YEAR, c.id);
    
    console.debug("[SIDEC] Fetching: "+fullUrl);    
    const response = await got(fullUrl);
    const $ = cheerio.load(response.body, {
      normalizeWhitespace: true
    });


    // Read the html source and iterate over each month
    $('#col-2 .calendar').each((index, element) => {

      let month = (index+1);     

      // Read each img parameter
      $(element).find($('.calendar-day img')).each((index2, element2) => {

        let item = $(element2).attr("src"); // /extension/sidec/design/sidec/images/calendar/caption-dechets_menagers/caption-dechets_menagers-16.gif 
        item = item.substring(item.lastIndexOf("caption-") + 8, item.lastIndexOf(".")); // extract the interesting part, eg. "dechets_menagers-16" 

        let itemDate = new Date(month + "/" + item.substring(item.lastIndexOf("-") + 1,item.length) + "/" + YEAR); // MM/DD/YYYY
        let itemTypes = [];
        
        itemTypes = extractTypes(item.substring(0,item.lastIndexOf("-")).replace(/_/g, " "));
        
        // Iterate if multiple types have been found on the same day
        for (type of itemTypes) {         

          // As the output must be "postal code centric", let's duplicate calendar entries for each postal code of the given commune
          for (cp of tmpCodePostal) {          
            let clt = new Collecte("", itemDate.valueOf(), c.commune, "", "", cp,  type);
            collecteList.push(clt);
          }

        }
      });
    });

    console.debug("[SIDEC] Collectes entries :"+collecteList.length);
  }

  return(collecteList); 
}

module.exports.download = function (addressList) {
  return download(addressList);
}

module.exports.getCommuneUrl = function (y,c) {
  return getCommuneUrl(y,c);
}