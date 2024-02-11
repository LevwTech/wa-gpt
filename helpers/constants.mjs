export const START_MESSAGE = "Start using WhatsApp AI Assistant";
export const START_MESSAGE_REPLY = "Hello! 👋 I am your WhatsApp AI Assistant 🤖 I can help you with your queries. Please type your query and I will try to help you. You can generate images 🖼️ or stickers by adding the words sticker or image at the beginning of your message"
export const BOT_PHONE_NUMBER = "+201064134160";
export const WHATSAPP_URL = `https://api.whatsapp.com/send/?phone=${BOT_PHONE_NUMBER}&text=${START_MESSAGE.replace(/ /g, "%20")}`;
export const MAX_NUMBER_OF_MESSAGES = 30;
export const SUMMARIZE_SYSTEM_MESSAGE = { content: "Summarize the conversation so far.", role: "system"}
export const WHATSAPP_MAX_TEXT_LENGTH = 4096;
export const DALLE_MAX_TEXT_LENGTH = 1000;
export const STICKER_WAIT_MESSAGE = "Hold tight! your awesome sticker is being generated ⏳";
export const IMAGE_WAIT_MESSAGE = "Hold tight! I'm generating your image ⏳🖼️";
export const STARTER_TOKENS_COUNT = 20;
export const TEXT_TOKEN_COST = 1;
export const IMAGE_TOKEN_COST = 4;
export const STICKER_TOKEN_COST = 5;