import { WHATSAPP_URL } from "./constants.mjs";
export const getAction = (event) => event.requestContext.http.path.split("/")[1];

export const getBody = (event) => JSON.parse(event.body);


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

export const checkIfMediaRequest = (text, type) => {
  const trimmedText = text.trim().toLowerCase();
  return trimmedText.startsWith(`/${type}`) || trimmedText.startsWith(`${type}`);
}

export const extractMediaRequestPrompt = (text, type) => {
  const trimmedText = text.trim();
  if (trimmedText.toLowerCase().startsWith(`/${type}`)) {
      return trimmedText.slice(6).trim();
  } else if (trimmedText.toLowerCase().startsWith(`${type}`)) {
      return trimmedText.slice(5).trim();
  } else {
      return trimmedText;
  }
}

// export const generateStickerPrompt = text => {
//   return 'A visual sticker with white stroke of: #FFFFFF.' + text;
// }

export const getWhatsAppBotUrl = (payload) => {
  return WHATSAPP_URL
}