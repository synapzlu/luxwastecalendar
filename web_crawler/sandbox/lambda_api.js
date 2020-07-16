const fs = require('fs');

const folder = 64202004252;

let now = new Date();

var getNextCollectesByPostalCode = function (pc, opts) {
    
    
    let file = fs.readFileSync(`./output/${folder}/${pc}.json`);
    let collectes = JSON.parse(file);
    let nextCollectes = [];

    let maxresults = opts['maxresults'] ? opts['maxresults'] : 2;

    if (opts['summaryfilter']) {
        nextCollectes = collectes.filter(coll => coll.codepostal === pc && new Date(coll.event_date) >= now && coll.summary.toLowerCase().includes(opts['summaryfilter'].toLowerCase())).slice(0, maxresults);
    } else {
        nextCollectes = collectes.filter(coll => coll.codepostal === pc && new Date(coll.event_date) >= now).slice(0, maxresults);
    }


    return nextCollectes;
}

console.log(getNextCollectesByPostalCode(1135, {"maxresults":"1"}));

console.log(getNextCollectesByPostalCode(1135, {"maxresults":"1", "summaryfilter":"Verre"}));
