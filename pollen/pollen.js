const cheerio = require('cheerio');
const got = require('got');

const vgmUrl= 'http://www.pollen.lu/index.php?qsPage=data&year=2020&week=30&qsLanguage=Fra';

(async () => {
  const response = await got(vgmUrl);
  const $ = cheerio.load(response.body, {
    normalizeWhitespace: true
});

  $('.shortcut tr td').each(function(){
    // console.log($(this).text());    
  });
  // $('div.tillgodo tbody tr').each(function(){

  let plop =  $('.shortcut tr td');
  console.log($(plop[0]).text());    
  
})();