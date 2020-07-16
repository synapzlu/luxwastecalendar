const request = require('request');
const today = new Date();

let speakOutput = ``;
const postalCode = 1135;
const url = `https://xxxxxxxxxx/prod/?postalcode=${postalCode}`;  
            
request.get(url, (error, response, body) => {
    let json = JSON.parse(body);
    
    console.log('error:', error); // Print the error if one occurred
    console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
    console.log('body:', body); // Print the body

    if (response && response.statusCode == 400) {
        speakOutput = `Malheuresement le code postal ${postalCode} n'est pas encore supporté ou n'existe pas`;
    } else {

       if (json.collecteList.length > 0) {
        
            let firstDate = json.collecteList[0].event_date;    
            let targetCollecteList = json.collecteList.filter(coll => coll.event_date === firstDate);
            console.log(targetCollecteList);

            speakOutput += `Les déchets `;
                        
            for (const [i, c] of targetCollecteList.entries()) {
                speakOutput += `de type ${c.summary} `;
                speakOutput += i === targetCollecteList.length-1 ? `, ` : `et `;
            }

            speakOutput += `seront collectés le ${firstDate} dans votre rue`;
            
        } else {
            speakOutput = `Hmm hmm je n'ai rien trouvé pour ce code postal. J'en informe immediatement mon équipe.`;
        }
    }   
    
    console.log(speakOutput);
    });