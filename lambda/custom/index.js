/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk-core');

const BACKGROUND_IMAGE_URL = 'https://s3.eu-west-3.amazonaws.com/racelinetv/logo.PNG',
    VIDEO_URL = 'https://s3.eu-west-3.amazonaws.com/racelinetv/video_de_presentation.mp4',
    VIDEO_TITLE = "RaceLine TV",
    TITLE = 'RaceLine TV',
    TEXT = 'Quelques minutes de présentation de notre projet.';

const PlayVideoIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest' ||
            (handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
                handlerInput.requestEnvelope.request.intent.name === 'PlayVideoIntent');
    },
    handle(handlerInput) {
        if (supportsDisplay(handlerInput)) {

            let backgroundImage = new Alexa.ImageHelper()
                .withDescription(TITLE)
                .addImageInstance(BACKGROUND_IMAGE_URL)
                .getImage();

            let primaryText = new Alexa.RichTextContentHelper()
                .withPrimaryText(TEXT)
                .getTextContent();

            let myTemplate = {
                type: 'BodyTemplate1',
                token: 'Welcome',
                backButton: 'HIDDEN',
                backgroundImage: backgroundImage,
                title: TITLE,
                textContent: primaryText,
            }

            handlerInput.responseBuilder
                .addVideoAppLaunchDirective(VIDEO_URL, VIDEO_TITLE)
                .addRenderTemplateDirective(myTemplate)
                .withSimpleCard(TITLE);

        } else {
            handlerInput.responseBuilder
                .withSimpleCard(TITLE, "This skill requires a device with the ability to play videos.")
                .speak("The video cannot be played on your device. To watch this video, try launching this skill from an compatible device.");
        }

        return handlerInput.responseBuilder
            .getResponse();

    },
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speechText = 'This skill just plays a video when it is started. It does not have any additional functionality.';

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    },
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent' ||
                handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speechText = 'Goodbye!';

        return handlerInput.responseBuilder
            .speak(speechText)
            .getResponse();
    },
};

const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

        return handlerInput.responseBuilder.getResponse();
    },
};

const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`Error handled: ${error.message}`);

        return handlerInput.responseBuilder
            .speak('Sorry, I can\'t understand the command. Please say again.')
            .reprompt('Sorry, I can\'t understand the command. Please say again.')
            .getResponse();
    },
};

function supportsDisplay(handlerInput) {
    const hasDisplay =
        handlerInput.requestEnvelope.context &&
        handlerInput.requestEnvelope.context.System &&
        handlerInput.requestEnvelope.context.System.device &&
        handlerInput.requestEnvelope.context.System.device.supportedInterfaces &&
        handlerInput.requestEnvelope.context.System.device.supportedInterfaces.Display;
    return hasDisplay;
}

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
    .addRequestHandlers(
        PlayVideoIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler
    )
    .addErrorHandlers(ErrorHandler)
    .lambda();