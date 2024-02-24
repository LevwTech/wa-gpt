export const START_MESSAGE = "Hey, what can you do?";
export const START_MESSAGE_REPLY = "I'm your WhatsApp AI Assistant! I'm here to assist you with any questions you have and help with generating images and stickers. Simply use the /image and /sticker commands followed by a description, and I'll take care of the rest! Feel free to ask me anything 🤖✨";
export const SUBSCRIBED_MESSAGE = "Thank you for subscribing! ✨ I'm here to help you navigate through questions and create images and stickers for you. To kick things off, just type /image or /sticker followed by a description, and I'll work my magic. Let's get started! 🚀🤖";
export const UPGRADED_SUBSCRIPTION_MESSAGE = "Congratulations on upgrading your subscription! 🎉 Get ready to enjoy even more image and sticker generation features. I'm here to enhance your experience and assist you in creating captivating visuals. Feel free to explore new possibilities by typing /image or /sticker followed by a description. Let's elevate your creativity to new heights! 🚀✨";
export const BOT_PHONE_NUMBER = "+201064134160";
export const WHATSAPP_URL = `https://api.whatsapp.com/send/?phone=${BOT_PHONE_NUMBER}&text=${START_MESSAGE.replace(/ /g, "%20").replace("?","%3F")}`;
export const MAX_NUMBER_OF_MESSAGES = 30;
export const SUMMARIZE_SYSTEM_MESSAGE = { content: "Summarize the conversation so far.", role: "system"}
export const WHATSAPP_MAX_TEXT_LENGTH = 4096;
export const DALLE_MAX_TEXT_LENGTH = 4000;
export const STICKER_WAIT_MESSAGE = "Hold tight! your awesome sticker is being generated ⏳";
export const IMAGE_WAIT_MESSAGE = "Hold tight! I'm generating your image ⏳🖼️";
export const FREE_STARTER_QUOTA = 5;
export const TEXT_TOKEN_COST = 1/150;
export const TEXT_TOKEN_COST_FREE = 1/50;
export const IMAGE_TOKEN_COST = 1;
export const STICKER_TOKEN_COST = 1;
export const RATE_LIMIT_ERROR_MESSAGE = "rate_limit_exceeded";
export const RATE_LIMIT_MESSAGE = "I'm sorry, I'm currently experiencing a high volume of requests. Please try again later. 🙏";
export const GUMROAD_PAYMENT_URL = "https://whatsapp-assistant.com/buy";
export const GUMROAD_UPDATE_SUBSCRIPTION_URL = "https://app.gumroad.com/subscriptions";
export const TIERS = {
    "Basic Plan": 50,
    "Standard Plan (Best Deal)": 200,
    "Pro Plan": 500,
}
export const GUMROAD_RESOURCE_TYPES = {
    SALE: "sale",
    SUBSCRIPTION_RESTARTED: "subscription_restarted",
    SUBSCRIPTION_UPDATED: "subscription_updated",
    SUBSCRIPTION_ENDED: "subscription_ended",
    CANCELLATION: "cancellation",
    REFUND: "refund",
    DISPUTE: "dispute",
    DISPUTE_WON: "dispute_won",
};
export const UNSUBSCRIBE_RESOURCE_TYPES = [GUMROAD_RESOURCE_TYPES.SUBSCRIPTION_ENDED, GUMROAD_RESOURCE_TYPES.CANCELLATION, GUMROAD_RESOURCE_TYPES.REFUND, GUMROAD_RESOURCE_TYPES.DISPUTE, GUMROAD_RESOURCE_TYPES.DISPUTE_WON];