export const START_MESSAGE = "Start using WhatsApp AI Bot";
export const START_MESSAGE_REPLY = "Hello! 👋 I am your WhatsApp AI Assistant. I can help you with your queries. Please type your query and I will try to help you. You can generate images 🖼️ or stickers by adding the words image or sticker before your message."
export const BOT_PHONE_NUMBER = "+15551297446";
export const WHATSAPP_URL = `https://api.whatsapp.com/send/?phone=${BOT_PHONE_NUMBER}&text=${START_MESSAGE.replace(/ /g, "%20")}`;
export const MAX_NUMBER_OF_MESSAGES = 30;
export const SUMMARIZE_SYSTEM_MESSAGE = { content: "Summarize the conversation so far.", role: "system"}
export const WHATSAPP_MAX_TEXT_LENGTH = 4096;
export const STICKER_WAIT_MESSAGE = "Hold tight! your awesome sticker is being generated ⏳";
export const IMAGE_WAIT_MESSAGE = "Hold tight! I'm generating your image ⏳🖼️";