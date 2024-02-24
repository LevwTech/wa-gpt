import querystring from "querystring";
import { WHATSAPP_URL } from "./constants.mjs";
export const getAction = (event) => event.rawPath.split("/")[1];

export const getBody = (event) => {
  let body;
  if (event.headers['content-type'] === 'application/x-www-form-urlencoded') {
    const decodedBody = Buffer.from(event.body, 'base64').toString('utf-8');
    body = body = parseNestedQueryString(decodedBody);
  } else {
    body = event.body ? JSON.parse(event.body) : {};
  } 
  return body;
}
const parseNestedQueryString = (queryString) => {
  const nestedObject = {};
  const queryParams = querystring.parse(queryString);

  for (let key in queryParams) {
    const value = queryParams[key];
    setNestedProperty(nestedObject, key, value);
  }

  return nestedObject;
}

const setNestedProperty = (obj, keyPath, value) => {
  const keys = keyPath.split('.');
  let nestedObj = obj;

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (i === keys.length - 1) {
      nestedObj[key] = value;
    } else {
      nestedObj[key] = nestedObj[key] || {};
      nestedObj = nestedObj[key];
    }
  }
}

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

export const getWhatsAppBotUrl = (payload) => {
  return WHATSAPP_URL
}

export const getCurrentUnixTime = () => Math.floor(Date.now() / 1000);

export const getNextRenewalUnixTime = (prevRenewalUnixTime) => prevRenewalUnixTime + 30 * 24 * 60 * 60;