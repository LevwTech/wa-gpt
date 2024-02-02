export const START_MESSAGE = "Start using WhatsApp AI Bot";
export const START_MESSAGE_REPLY = "Hello! I am a WhatsApp AI Bot. I can help you with your queries. Please type your query and I will try to help you.";
export const BOT_PHONE_NUMBER = "+15551297446";
export const MESSAGES_DAYS_TILL_EXPIRATION = 2;
export const WHATSAPP_URL = `https://api.whatsapp.com/send/?phone=${BOT_PHONE_NUMBER}&text=${START_MESSAGE.replace(/ /g, "%20")}`;
export const OPEN_AI_SYSTEM_MESSAGE = {
    role: "system",
    content: "You are a helpful assistant inside WhatsApp"
};