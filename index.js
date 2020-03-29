const https = require('https');
const fs = require('fs');

const MAX_VDL = 798; // As found on https://www.vdl.lu/fr/vivre/domicile-au-quotidien/collecter-et-trier-ses-dechets/calendrier-des-collectes/

var download = function(url, dest, cb) {
    var file = fs.createWriteStream(dest);
    var request = https.get(url, function(response) {
      response.pipe(file);
      file.on('finish', function() {
        file.close(cb);  // close() is async, call cb after close completes.
      });
    }).on('error', function(err) { // Handle errors
      fs.unlink(dest); // Delete the file async. (But we don't check the result)
      if (cb) cb(err.message);    
    });
  };



var cleanup = function() {
    // fs.unlink('tmp', (err) => {
    //     if (err) throw err;
    //     console.log('successfully deleted tmp');
    //   });

    fs.mkdir('tmp/vdl', { recursive: true }, (err) => {
        if (err) throw err;
      });
}


async function vdl_download() {
    var index = 0;
    var url;
    do {
        index += 1;
        url = `https://www.vdl.lu/fr/vivre/domicile-au-quotidien/collecter-et-trier-ses-dechets/calendrier-des-collectes-new/${index}/all/ical.ics`; 
        console.log(url);        
        download(url, `tmp/vdl/vdl${index}.ics`, function() {}); 
        await sleep(Math.random()*500);
    } while (index<MAX_VDL);
    
}

function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }   


///// Main

cleanup();
vdl_download();






