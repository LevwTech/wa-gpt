import querystring from "querystring";
import { WHATSAPP_URL } from "./constants.mjs";
export const getAction = (event) => event.rawPath.split("/")[1];

export const getBody = (event) => {
  let body;
  if (event.headers['content-type'] === 'application/x-www-form-urlencoded') {
    const decodedBody = Buffer.from(event.body, 'base64').toString('utf-8');
    body = parseFormUrlEncoded(decodedBody);
  } else {
    body = event.body ? JSON.parse(event.body) : {};
  } 
  return body;
}
const parseFormUrlEncoded = (bodyString) => {
  const parsedBody = querystring.parse(bodyString);
  Object.keys(parsedBody).forEach((key) => {
    const value = parsedBody[key];
    if (typeof value === 'string' && value.includes('=')) {
      parsedBody[key] = parseFormUrlEncoded(value);
    }
  });
  return parsedBody;
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