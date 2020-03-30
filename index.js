const https = require('https');
const fs = require('fs');
const ical = require('node-ical');

const Collecte = require('./classes/Collecte');
var collecteList = [];

const MAX_VDL = 2; // 798 As found on https://www.vdl.lu/fr/vivre/domicile-au-quotidien/collecter-et-trier-ses-dechets/calendrier-des-collectes/



////////// Utility functions
var cleanup = function() {
    fs.mkdir('tmp/', { recursive: true }, (err) => {
        if (err) throw err;
      });
}

var writeFile = function(cc, dest, callback) {    
    let json = JSON.stringify(cc);
    fs.writeFile(dest, json, 'utf8', callback);
}

var sleep = function(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }   

var datetimestamp = function()
{
let today = new Date();
let sToday = today.getDate().toString();
sToday += (today.getMonth()+1).toString();
sToday += today.getFullYear().toString();
sToday += today.getHours().toString();
sToday += today.getMinutes().toString();
sToday += today.getSeconds().toString();
return sToday;
}

//////////// VDL specific functions

async function vdl_download() {
    let index = 0;
    let url;
    do {
        index += 1;    
        url = `https://www.vdl.lu/fr/vivre/domicile-au-quotidien/collecter-et-trier-ses-dechets/calendrier-des-collectes-new/${index}/all/ical.ics`;
        vdl_icsParse(url);
        await sleep(Math.random()*500); // Bypass http request rate protection from target web hosting
    } while (index<MAX_VDL);
     writeFile(collecteList, `VDL_${datetimestamp()}.json`, function() {});
}


function vdl_icsParse(url) {    
    console.log(url);
    ical.async.fromURL(url, {}, function(err, data) {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        for (let k in data) {
            if (data.hasOwnProperty(k)) {
                const ev = data[k];
                if (data[k].type == 'VEVENT') {
                    collecteList.push(new Collecte(ev.uid, ev.start, "Luxembourg Ville", ev.location, ev.summary));                 
                }
            }
        }
    });
}



///// Main
cleanup();
vdl_download();










