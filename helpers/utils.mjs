import { WHATSAPP_URL } from "./constants.mjs";
export const getAction = (event) => event.rawPath.split("/")[1];

export const getBody = (event) => event.body ? JSON.parse(event.body) : {};

export const handleBadRequest = () => ({
  statusCode: 400,
  body: "Bad Request",
});

export const handleMessageReceived = () => ({
  statusCode: 200,
  body: "Message Received",
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