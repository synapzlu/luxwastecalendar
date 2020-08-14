'use strict';
const fs = require('fs');

const DEFAULT_MAXRESULTS = 5;

var sameDayOrLater = function (d1) {
    // Timezone fix : adding an arbitrary offset of 4 hours (4*3600000 ms) to make same-day-compare work
    // Bug description : calendar events are all registered at 00:00:00 UTC+1 or UCT+2 (Europe/Luxembourg).
    // So when comparing with an UTC baseline, it might slip over 2 different days and break the same-day-compare 
    // TODO : remove the ugly hardcoded rule to filter out events happening same day before 10am UTC
    let d2 = new Date();
    d1 = new Date(d1.getTime() + (4 * 3600000));
    if (d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate() && d2.getHours > 10)
        return true
    else if (d1 >= d2)
        return true
    else
        return false
}

// This function returns the next calendar events at a given postal code
// Opts : maxresults ; summaryfilter
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
        nextCollectes = collectes.filter(coll => coll.codepostal === pc && sameDayOrLater(new Date(coll.event_date)) && coll.summary.toLowerCase().includes(opts['summaryfilter'].toLowerCase())).slice(0, maxresults);
    } else {
        nextCollectes = collectes.filter(coll => coll.codepostal === pc && sameDayOrLater(new Date(coll.event_date))).slice(0, maxresults);
    }

    // TODO : Move local time conversion to the alexa skill
    let collectFix = [];
    for (let c of nextCollectes) {
        c.event_date = new Date(c.event_date).toLocaleDateString(undefined, { timeZone: "Europe/Luxembourg" });
        collectFix.push(c);
    }

    return collectFix;
}


// Exports for Lambda/API Gateway integration
exports.handler = function (event, context, callback) {

    if (event.postalcode === undefined) {
        callback("400 Invalid Input");
    }

    let postalcode = Number(event.postalcode);
    let maxresults = event.maxresults ? event.maxresults : DEFAULT_MAXRESULTS;
    let collecteList = [];

    // TODO : Implement summary filter
    try {
        collecteList = getNextCollectesByPostalCode(postalcode, { "maxresults": maxresults });
        // collecteList = getNextCollectesByPostalCode(postalcode, {"maxresults":maxresults, "summaryfilter":"GLASS"});
    } catch (err) {
        callback(err);
    }

    // CloudWatch logging
    console.log("STAT: Postalcode=" + postalcode);
    console.debug(collecteList);

    callback(null, {
        "collecteList": collecteList
    });
};


// This code exists only for local debug purposes
var localdebug = function () {

    // let res = getNextCollectesByPostalCode(7513, { maxresults: '3', summaryfilter: 'PMC' });
    let res = getNextCollectesByPostalCode(7513, { maxresults: '3' });
    for (let c of res) {
        console.log(c);
    }
}
localdebug();