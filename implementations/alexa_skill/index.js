// Session attributes : https://developer.amazon.com/fr-FR/docs/alexa/custom-skills/manage-skill-session-and-session-attributes.html

const Alexa = require('ask-sdk-core');
const request = require('request');

const months = new Array('Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Aout', 'Septembre', 'Octobre', ' Décembre')

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speakOutput = 'Bienvenue sur Calendrier des Collectes de déchets. Je peux vous renseigner sur les prochaines collectes de déchets de la Ville de Luxembourg. Il vous suffit de m\'indiquer votre code postal.';
        const repromptOutput = `Quel est votre code postal ?`;
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(repromptOutput)
            .getResponse();
    }
};
const getCollecteHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'getCollecte';
    },
    async handle(handlerInput) {

        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        const postalCodeSlotValue = Alexa.getSlotValue(handlerInput.requestEnvelope, 'postalCode');
        const dateSlotValue = Alexa.getSlotValue(handlerInput.requestEnvelope, 'date');

        let speakOutput = "";
        let repromptOutput = "";


        // Storing/updating postal code session attribute
        if (postalCodeSlotValue) {
            console.log(`Storing/updating postal code ${postalCodeSlotValue} session attribute`);
            sessionAttributes.postalCode = postalCodeSlotValue;
            handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
        }

        // If not provided, request it first
        else {

            speakOutput = speakOutput + `Pour répondre à cela merci de m'indiquer votre code postal à quatre chiffres. `;
            repromptOutput = `Quel est votre code postal ?`;

            return handlerInput.responseBuilder
                .speak(speakOutput)
                .addElicitSlotDirective('postalCode')
                .reprompt(repromptOutput)
                .getResponse();
        }

        speakOutput += await queryAPI(sessionAttributes.postalCode, dateSlotValue);

        return handlerInput.responseBuilder
        .speak(speakOutput)
        .getResponse();

    }
};



// Default Alexa intents
const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = `Pour connaitre le type de collecte de déchets dans votre rue, il vous suffit de me demander par exemple : quelle sera la prochaine collecte dans ma rue?`;

        return handlerInput.responseBuilder
            .speak(speakOutput) 
            .reprompt(speakOutput)
            .getResponse();
    }
};
const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = `A bientôt!`;
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse();
    }
};

// The intent reflector is used for interaction model testing and debugging.
// It will simply repeat the intent the user said. You can create custom handlers
// for your intents by defining them above, then also adding them to the request
// handler chain below.
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`~~~~ Error handled: ${error.stack}`);
        const speakOutput = `Désolé mais j'ai des difficultés à réaliser cela. Merci de reformuler ou de réessayer plus tard.`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

// The SkillBuilder acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = Alexa.SkillBuilders.custom()
    .withSkillId("amzn1.ask.skill.93439eff-393c-41e9-b69c-70668d556d0e")
    .addRequestHandlers(
        LaunchRequestHandler,
        getCollecteHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
    )
    .addErrorHandlers(
        ErrorHandler,
    )
    .lambda();
    
    
    
// Utility

function queryAPI(postalCode, date) {
    
    return new Promise(((resolve, reject) => {
        
    let speakOutput = ``;    
    const url = `https://hfgkzf8z8b.execute-api.eu-west-1.amazonaws.com/prod/?postalcode=${postalCode}`;  
        
        request.get(url, (error, response, body) => {
            
            let json = JSON.parse(body);
            
            console.log('error:', error); // Print the error if one occurred
            console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
            console.log('body:', body); // Print the body
        
            if (response && response.statusCode === 400) {
                speakOutput = `Malheuresement le code postal ${postalCode} n'est pas encore supporté ou n'existe pas`;
                
            } else {
        
               if (json.collecteList.length > 0) {
                   
                   // Check if specific date was requested
                    if (date) {
                        console.log(`Date requested but can't deliver`);
                        speakOutput = speakOutput + `Je ne peux pas encore vous renseigner sur une date précise, mais voici ce que j'ai trouvé pour le prochain passage:`;
                    }
                
                    let firstDate = json.collecteList[0].event_date;    
                    let structDate = new Date(Date.parse(firstDate));
                    let targetCollecteList = json.collecteList.filter(coll => coll.event_date === firstDate);
                    console.log(targetCollecteList);
        
                    speakOutput += `Les déchets `;
                                
                    for (const [i, c] of targetCollecteList.entries()) {
                        speakOutput += `de type ${c.summary} `;
                        speakOutput += i === targetCollecteList.length-1 ? `, ` : `et `;
                    }

                    //speakOutput += targetCollecteList.length > 1 ? `seront ` : `sera `;
                    speakOutput += `seront collecté le ${structDate.getDate()} ${months[structDate.getMonth()]} ${structDate.getFullYear()} au code postal ${postalCode}`;
                    
                } else {
                    speakOutput = `Hmm hmm je n'ai rien trouvé pour ce code postal. J'en informe immediatement mon équipe.`;
                }
            }   
            
            console.log(speakOutput);
            resolve(speakOutput);
            
            });

    }));
        
}