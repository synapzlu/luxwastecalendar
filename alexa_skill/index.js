// Reference doc :
// Localisation : https://developer.amazon.com/fr/blogs/alexa/post/285a6778-0ed0-4467-a602-d9893eae34d7/how-to-localize-your-alexa-skills
// Session attributes : https://developer.amazon.com/fr-FR/docs/alexa/custom-skills/manage-skill-session-and-session-attributes.html


// SECRETS
const API_URL = "https://hfgkzf8z8b.execute-api.eu-west-1.amazonaws.com/prod/";
const API_KEY = "7hRDxGuiQz2wNBO5K5LXB9nzpQrY7Ioc7jbaoMw4";
const SKILL_ID = "amzn1.ask.skill.e072e8a9-dd1e-4b13-8bbb-26e23ec50bee";


const Alexa = require('ask-sdk-core');
const request = require('request');
const i18n = require('i18next'); 
const sprintf = require('i18next-sprintf-postprocessor'); 

const languageStrings = {
    'en' : require('./i18n/en'),
    'de' : require('./i18n/de'),
    'fr' : require('./i18n/fr') 
}

const monthsArray = new Array('JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'DEC')

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const requestAttributes = handlerInput.attributesManager.getRequestAttributes();

        const speakOutput = requestAttributes.t('GREETING');
        const repromptOutput =  requestAttributes.t('REQUEST_POSTAL_CODE');
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
        
        const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        const postalCodeSlotValue = Alexa.getSlotValue(handlerInput.requestEnvelope, 'postalCode');
        const dateSlotValue = Alexa.getSlotValue(handlerInput.requestEnvelope, 'date');

        let speakOutput = "";
        let repromptOutput = "";


        // Storing/updating postal code session attribute
        if (postalCodeSlotValue !== null && postalCodeSlotValue !== '' & postalCodeSlotValue !== 'NaN' ) {
            console.log(`Storing/updating postal code ${postalCodeSlotValue} session attribute`);
            sessionAttributes.postalCode = postalCodeSlotValue;
            handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
        }

        // If not provided, requests it first
        else {

            speakOutput = requestAttributes.t('REQUEST_POSTAL_CODE');
            repromptOutput =  requestAttributes.t('REQUEST_POSTAL_CODE_SHORT');

            return handlerInput.responseBuilder
                .speak(speakOutput)
                .addElicitSlotDirective('postalCode')
                .reprompt(repromptOutput)
                .getResponse();
        }

        speakOutput += await queryAPI(sessionAttributes.postalCode, dateSlotValue, handlerInput);

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
        const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
        const speakOutput = requestAttributes.t('HELP');
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
        const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
        const speakOutput = requestAttributes.t('BYE');
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
// Debugging handler
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
// Generic error handling to capture any syntax or routing errors. 
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`~~~~ Error handled: ${error.stack}`);
        
        const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
        const speakOutput = requestAttributes.t('ERROR');

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
const LocalizationInterceptor = {
    process(handlerInput) {
        const localizationClient = i18n.use(sprintf).init({
            lng: handlerInput.requestEnvelope.request.locale,
            fallbackLng: 'fr', // fallback to FR if locale doesn't exist
            resources: languageStrings
        });

        localizationClient.localize = function () {
            const args = arguments;
            let values = [];

            for (var i = 1; i < args.length; i++) {
                values.push(args[i]);
            }
            const value = i18n.t(args[0], {
                returnObjects: true,
                postProcess: 'sprintf',
                sprintf: values
            });

            if (Array.isArray(value)) {
                return value[Math.floor(Math.random() * value.length)];
            } else {
                return value;
            }
        }

        const attributes = handlerInput.attributesManager.getRequestAttributes();
        attributes.t = function (...args) { // pass on arguments to the localizationClient
            return localizationClient.localize(...args);
        };
    },
};


// Order matters !
exports.handler = Alexa.SkillBuilders.custom()
    .withSkillId(SKILL_ID)
    .addRequestHandlers(
        LaunchRequestHandler,
        getCollecteHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler
        //IntentReflectorHandler // For debugging
    )
    .addRequestInterceptors(LocalizationInterceptor)
    .addErrorHandlers(ErrorHandler)
    .lambda();
    
    
    
// Utility functions
function queryAPI(postalCode, date, handlerInput) {
    
    return new Promise(((resolve, reject) => {
        
        let speakOutput = ``;    
        const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
        const url = `${API_URL}?postalcode=${postalCode}`;
        const options = {
            headers: {
            'X-API-KEY': `${API_KEY}`
            }
        }       
            
        request.get(url, options, (error, response, body) => {
            
            let json = JSON.parse(body);
            
            console.log('error:', error); // Print the error if one occurred
            console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
            console.log('body:', body); // Print the body
        
            if (response && response.statusCode === 400) {
                
                speakOutput = requestAttributes.t('UNKNOWN_POSTAL_CODE', postalCode);

                
            } else {
        
                if (json.collecteList.length > 0) {
                    
                    // Check if specific date was requested
                        if (date) {
                            console.log(`Date requested but can't deliver`);
                            speakOutput =  requestAttributes.t('DATE_NOT_SUPPORTED');
                        }
                    
                        // Retrieve date of the first element, then use it to retrieve all elements with the same date
                        let firstDate = json.collecteList[0].event_date;    
                        let structDate = new Date(Date.parse(firstDate));
                        let targetCollecteList = json.collecteList.filter(coll => coll.event_date === firstDate);
                        
                        console.log(targetCollecteList);
            
                        let targetDechets = "";
                        let targetDate = `${structDate.getDate()} ${requestAttributes.t(monthsArray[structDate.getMonth()])} ${structDate.getFullYear()}`;
                        
                        for (const [i, c] of targetCollecteList.entries()) {
                            targetDechets += `${c.summary} `;
                            targetDechets += i === targetCollecteList.length-1 ? `, ` : requestAttributes.t('AND');
                        }
                                        
                        speakOutput += requestAttributes.t('MAIN_ANSWER', targetDechets, targetDate, postalCode);
                    } else {
                        speakOutput =  requestAttributes.t('ERROR_POSTAL_CODE');
                    }
            }   
            
            console.log(speakOutput);
            resolve(speakOutput);
            
        });

    }));
    
}


