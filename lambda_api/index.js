'use strict';
const fs = require('fs');

console.log('Loading function');

const DEFAULT_MAXRESULTS = 5;
let now = new Date();

var getNextCollectesByPostalCode = function (pc, opts) {
    let file;
    try {
        file = fs.readFileSync(`repo/${pc}.json`);
    } catch (err) {
        throw ("400 Postal code not supported");
    }
    
    let collectes = JSON.parse(file);
    let nextCollectes = [];

    let maxresults = opts['maxresults'] ? opts['maxresults'] : DEFAULT_MAXRESULTS;

    if (opts['summaryfilter']) {
        nextCollectes = collectes.filter(coll => coll.codepostal === pc && new Date(coll.event_date) >= now && coll.summary.toLowerCase().includes(opts['summaryfilter'].toLowerCase())).slice(0, maxresults);
    } else {
        nextCollectes = collectes.filter(coll => coll.codepostal === pc && new Date(coll.event_date) >= now).slice(0, maxresults);
    }
    return nextCollectes;
}


  
exports.handler = function(event, context, callback) {
  
  if (event.postalcode === undefined) {
        callback("400 Invalid Input");
  }
  
  let postalcode = Number(event.postalcode);
  let maxresults = event.maxresults ? event.maxresults : DEFAULT_MAXRESULTS;
  let collecteList = [];
  
  try {
      collecteList = getNextCollectesByPostalCode(postalcode, {"maxresults":maxresults});
    // collecteList = getNextCollectesByPostalCode(postalcode, {"maxresults":maxresults, "summaryfilter":"Verre"});
  } catch (err) {
       callback(err);
  }
  
  // Log to CloudWatch
  console.log(collecteList);

  callback(null, {
      "collecteList": collecteList
  }); 
};
