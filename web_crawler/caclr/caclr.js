const fs = require('fs');
const fixy = require('fixy'); // Fixed width column parser

// const stableUrl = "https://data.public.lu/fr/datasets/r/af76a119-2bd1-462c-a5bf-23e11ccfd3ee";

//////////// Address functions
async function getAddresses() {
    console.debug("[CACLR] Reading file");
    return new Promise(function (resolve, reject) {
        let tempList = [];       
        
        // TODO : download new version from stableUrl at runtime
        let file = fs.readFileSync('./caclr/TR.DICACOLO.RUCP', 'binary'); // Source enconding is CP-1252 but 'binary' seems to work also
        var rawList = fixy.parse({
            map: [{
                name: "Canton",
                width: 40,
                start: 1,
                type: "string"
            }, {
                name: "District",
                width: 40,
                start: 41,
                type: "string"
            }, {
                name: "Commune",
                width: 40,
                start: 81,
                type: "string"
            }, {
                name: "Localite",
                width: 40,
                start: 121,
                type: "string"
            }, {
                name: "Rue",
                width: 40,
                start: 161,
                type: "string"
            }, {
                name: "CodePostal",
                width: 40,
                start: 201,
                type: "int"
            }],
            options: {
                fullwidth: 205,
                skiplines: null,
                format: "json"
            }
        }, file);

        let delta = rawList.length;

        // Remove null values        
        rawList = rawList.filter(addr => !isNaN(addr.CodePostal));

        delta = delta - rawList.length; // Reference value in August 2020 : 121 entries removed

        console.debug("[CACLR] Address list size after cleanup:" + rawList.length + ". Delta="+delta); 
        
        // successfully fill promise
        resolve(rawList); 
        
    })
}


module.exports.getAddresses = function() {
    return getAddresses();
}
