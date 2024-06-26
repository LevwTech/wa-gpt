import LanguageDetect from 'languagedetect';
import { BOT_PHONE_NUMBER, SUPPORTED_LANGUAGES, SPANISH_LANGS, ARABIC_LANGS } from "./constants.mjs";
import MESSAGES from "./botMessages.mjs";

const langDetector = new LanguageDetect();

export const getAction = (event) => event.rawPath?.split("/")[1];

export const getBody = (event) => {
  let body;
  if (event.headers?.['content-type'] === 'application/x-www-form-urlencoded') {
    const decodedBody = Buffer.from(event.body, 'base64').toString('utf-8');
    body = parseFormUrlEncoded(decodedBody);
  } else {
    body = event.body ? JSON.parse(event.body) : {};
  } 
  return body;
}

const parseFormUrlEncoded = (bodyString) => {
  const params = {};
  const keyValuePairs = bodyString.split('&');
  keyValuePairs.forEach(keyValuePair => {
    const [key, value] = keyValuePair.split('=');
    const decodedKey = decodeURIComponent(key);
    const decodedValue = decodeURIComponent(value);
    if (decodedKey.includes('[')) {
      const keys = decodedKey.split(/\[|\]/).filter(Boolean);
      let obj = params;
      for (let i = 0; i < keys.length; i++) {
        const currentKey = keys[i];
        if (i === keys.length - 1) {
          if (Array.isArray(obj[currentKey])) {
            obj[currentKey].push(decodedValue);
          } else if (obj[currentKey]) {
            obj[currentKey] = [obj[currentKey], decodedValue];
          } else {
            obj[currentKey] = decodedValue;
          }
        } else {
          obj[currentKey] = obj[currentKey] || {};
          obj = obj[currentKey];
        }
      }
    } else {
      params[decodedKey] = decodedValue;
    }
  });
  return params;
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

export const checkCommandType = (text, type) => text.startsWith(`/${type}`);

export const extractCommandPrompt = (text, type) => {
  const prompt = text.slice(`/${type}`.length).trim();
  return prompt;
}

// export const generateStickerPrompt = text => {
//   return 'A visual sticker with white stroke of: #FFFFFF.' + text;
// }

export const getWhatsAppBotUrl = (lang) => {
  lang = lang.toLowerCase();
  if(!SUPPORTED_LANGUAGES.includes(lang)) lang = "en";
 const WHATSAPP_URL = `https://api.whatsapp.com/send/?phone=${BOT_PHONE_NUMBER}&text=${MESSAGES.START[lang].replace(/ /g, "%20").replace("?","%3F")}`;
  return WHATSAPP_URL
}

export const getCurrentUnixTime = () => Math.floor(Date.now() / 1000);

export const hasBeen4Hours = (unixTimestamp) => {
  const currentUnixTime = getCurrentUnixTime();
  const fourHoursInSeconds = 4 * 60 * 60;
  
  return (currentUnixTime - unixTimestamp) >= fourHoursInSeconds;
};

// This function is used to calculate the next renewal date which is after 1 month
export const getNextRenewalUnixTime = (prevRenewalUnixTime) => {
  const timestampInMilliseconds = prevRenewalUnixTime * 1000;
  const currentDate = new Date(timestampInMilliseconds);
  if (currentDate.getUTCMonth() === 11) {
    currentDate.setUTCFullYear(currentDate.getUTCFullYear() + 1);
    currentDate.setUTCMonth(0);
    return Math.floor(currentDate.getTime() / 1000);
  }
  currentDate.setUTCMonth(currentDate.getUTCMonth() + 1);
  const newUnixTimestamp = Math.floor(currentDate.getTime() / 1000);
  return newUnixTimestamp;
};

export const getLanguage = (text) => {
  if (!text) return 'en';
  if (checkCommandType(text, 'image')) text = extractCommandPrompt(text, 'image')
  if (checkCommandType(text, 'sticker')) text = extractCommandPrompt(text, 'sticker')
  let lang = 'en';
  switch (text) {
    case MESSAGES.START.en:
      lang = 'en';
      break;
    case MESSAGES.START.es:
      lang = 'es';
      break;
    case MESSAGES.START.ar:
      lang = 'ar';
      break;
    default:
      const detectedLang = langDetector.detect(text)?.[0]?.[0]; 
      if (SPANISH_LANGS.includes(detectedLang)) lang = 'es';
      else if (ARABIC_LANGS.includes(detectedLang)) lang = 'ar';
      else lang = 'en';
      break; 
  }
  return lang
}