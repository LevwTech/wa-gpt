import qs from 'qs';
import querystring from 'querystring';
import { BOT_PHONE_NUMBER, SUPPORTED_LANGUAGES, START_MESSAGE } from "./constants.mjs";
export const getAction = (event) => event.rawPath?.split("/")[1];

import querystring from 'querystring';

export const parseFormUrlEncoded = (encodedBody) => {
    const decodedBody = Buffer.from(encodedBody, 'base64').toString('utf-8');
    const parsedBody = querystring.parse(decodedBody);
    
    // Recursively parse nested fields
    const parseNestedFields = (obj) => {
        const parsedObj = {};
        for (const key in obj) {
            if (typeof obj[key] === 'object') {
                parsedObj[key] = parseNestedFields(obj[key]);
            } else {
                parsedObj[key] = obj[key];
            }
        }
        return parsedObj;
    };
    
    return parseNestedFields(parsedBody);
};

export const getBody = (event) => {
    let body;

    if (event.headers['content-type'] === 'application/x-www-form-urlencoded') {
        body = parseFormUrlEncoded(event.body);
    } else {
        body = event.body ? JSON.parse(event.body) : {};
    }

    return body;
};


export const handleBadRequest = () => ({
  statusCode: 400,
  body: "Bad Request",
});

export const handleNotificationReceived = () => ({
  statusCode: 200,
  body: "Notification Received",
});

export const headers = {
  "Content-Type": "application/json",
  Accept: "application/json",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "*",
  "X-Requested-With": "*",
  "Access-Control-Allow-Origin": "*",
};

export const limitTextLength = (text, maxLength) => {
  if (text.length > maxLength) {
      return text.substring(0, maxLength);
  } else {
      return text;
  }
}

export const checkIfMediaRequest = (text, type) => text.startsWith(`/${type}`);

export const extractMediaRequestPrompt = (text, type) => {
  const prompt = text.slice(`/${type}`.length).trim();
  return prompt;
}

// export const generateStickerPrompt = text => {
//   return 'A visual sticker with white stroke of: #FFFFFF.' + text;
// }

export const getWhatsAppBotUrl = (lang) => {
  lang = lang.toLowerCase();
  if(!SUPPORTED_LANGUAGES.includes(lang)) lang = "en";
 const WHATSAPP_URL = `https://api.whatsapp.com/send/?phone=${BOT_PHONE_NUMBER}&text=${START_MESSAGE[lang].replace(/ /g, "%20").replace("?","%3F")}`;
  return WHATSAPP_URL
}

export const getCurrentUnixTime = () => Math.floor(Date.now() / 1000);

export const getNextRenewalUnixTime = (prevRenewalUnixTime) => prevRenewalUnixTime + 30 * 24 * 60 * 60;