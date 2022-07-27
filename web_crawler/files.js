const fs = require('fs');

const utils = require('./utils');
const caclr = require('./caclr');


// Export content in a single file
module.exports.writeFile = writeFile;
function writeFile(data, datetimestamp, dest) {
    fs.mkdir(`output/${datetimestamp}`, { recursive: true }, (err) => {
        if (err) throw err;
    });

    let json = JSON.stringify(data, null, 2);
    fs.writeFileSync(`output/${datetimestamp}/${dest}`, json, 'utf8');
}

// Export content in multiple files for each postal code.
module.exports.writeByPostalCode = writeByPostalCode;
function writeByPostalCode(data, datetimestamp) {
    for (p of caclr.postalCodeList) {
        let tmpCollecte = data.filter(arg => arg.codepostal === p);
        if (tmpCollecte.length != 0) {
            // Sort events by date and dump files for offline processing
            writeFile(tmpCollecte.sort((e1, e2) => utils.sortByDate(e1.event_date, e2.event_date)), datetimestamp, `${p}.json`);
        }
    }
}

// Export content to cache.
module.exports.writeToCache = writeToCache;
function writeToCache(filename, data, connector) {
    fs.mkdir(`output/cache/${connector}`, { recursive: true }, (err) => {
        if (err) throw err;
    });

    fs.writeFileSync(`output/cache/${connector}/${filename}`, data, 'utf8');
}

// Read content from cache.
module.exports.readFromCache = readFromCache;
function readFromCache(filename, connector) {
    return fs.readFileSync(`output/cache/${connector}/${filename}`, 'utf-8');
}