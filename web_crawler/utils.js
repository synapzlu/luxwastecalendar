const caclr = require('./caclr');

const dataFix = {
    // Valorlux
    'Lac de la Haute Sûre': 'Lac de la Haute-Sûre',
    'Diekrich': 'Diekirch',
    // Sidec
    'Lac Haute Sûre': 'Lac de la Haute-Sûre',
};

module.exports.MODE_OFFLINE = 'offline';
module.exports.DRYRUN = 'dryrun'

// Normalize city names. Reference = caclr database
module.exports.normalizeCityName = function (city) {
    return dataFix[city] ? dataFix[city] : city;
}

// Return first item of a list
module.exports.first = function (p) {
    for (let i in p) return p[i];
}


// Generate a timestamp DDMMYYHHMMSS
module.exports.initDatetimestamp = function () {
    let today = new Date();
    let sToday = today.getDate().toString().padStart(2, '0');
    sToday += (today.getMonth() + 1).toString().padStart(2, '0');
    sToday += today.getFullYear().toString().substr(-2);
    sToday += today.getHours().toString().padStart(2, '0');
    sToday += today.getMinutes().toString().padStart(2, '0');
    sToday += today.getSeconds().toString().padStart(2, '0');
    return sToday;
}

// Sort function
module.exports.sortByDate = function (a, b) {
    const dateA = new Date(a);
    const dateB = new Date(b);

    let comparison = 0;
    if (dateA > dateB) {
        comparison = 1;
    } else if (dateA < dateB) {
        comparison = -1;
    }
    return comparison;
}

// Returns an array of postal codes
module.exports.getPostalCodesByCityName = function (city) {

    city = this.normalizeCityName(city);

    // Search on Commune level
    let tmpCodePostal = caclr.addressList.filter(addr => addr.Commune === city);
    tmpCodePostal = [...new Set(tmpCodePostal.map(x => x.CodePostal))]; // Remove duplicates

    // If nothing found on Commune level, let's try to search on Localité level
    if (tmpCodePostal.length === 0) {
        tmpCodePostal = caclr.addressList.filter(addr => addr.Localite === city);
        tmpCodePostal = [...new Set(tmpCodePostal.map(x => x.CodePostal))]; // Remove duplicates
    }

    if (tmpCodePostal.length === 0)
        console.error("[UTILS.getPostalCodesByCityName] Postal codes not found for " + city)

    return tmpCodePostal
}


// Returns an array of postal codes
module.exports.getPostalCodeByCityAndStreetName = function (city, street) {

    city = this.normalizeCityName(city);

    // Search on Commune level
    let tmpCodePostal = caclr.addressList.filter(addr => addr.Commune === city && addr.Rue === street);
    tmpCodePostal = [...new Set(tmpCodePostal.map(x => x.CodePostal))]; // Remove duplicates

    // If nothing found on Commune level, let's try to search on Localité level
    if (tmpCodePostal.length === 0) {
        tmpCodePostal = caclr.addressList.filter(addr => addr.Localite === city && addr.Rue === street);
        tmpCodePostal = [...new Set(tmpCodePostal.map(x => x.CodePostal))]; // Remove duplicates
    }

    if (tmpCodePostal.length === 0)
        console.error(`[UTILS.getPostalCodeByCityAndStreetName] Postal codes not found for ${city} - ${street}`);
  
    return tmpCodePostal;
}

