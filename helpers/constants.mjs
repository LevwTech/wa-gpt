export const SUPPORTED_LANGUAGES = ["en", "es", "ar"];
export const BOT_PHONE_NUMBER = "+201064134160";
export const MAX_NUMBER_OF_MESSAGES = 30;
export const SUMMARIZE_SYSTEM_MESSAGE = { content: "Summarize the conversation so far.", role: "system"}
export const WHATSAPP_MAX_TEXT_LENGTH = 4096;
export const DALLE_MAX_TEXT_LENGTH = 4000;
export const FREE_STARTER_QUOTA = 5;
export const TEXT_TOKEN_COST = 0.25;
export const AUDIO_TOKEN_COST_PER_MINUTE = 0.15;
export const IMAGE_TOKEN_COST = 1;
export const STICKER_TOKEN_COST = 1;
export const RATE_LIMIT_ERROR_MESSAGE = "rate_limit_exceeded";
export const GUMROAD_PAYMENT_URL = "https://levw.gumroad.com/l/whatsapp";
export const GUMROAD_UPDATE_SUBSCRIPTION_URL = "https://app.gumroad.com/subscriptions";
export const TIERS = {
    "Basic Plan": 40,
    "El Plan Básico": 40,
    "الاشتراك الأول": 40,
    "Standard Plan (Best Deal)": 120,
    "Plan Estándar (Mejor Oferta)": 120,
    "الاشتراك المتوسط (الصفقة الأفضل)": 120,
    "Pro Plan": 400,
    "Plan Profesional": 400,
    "الاشتراك المتقدم": 400
}
export const PRO_PLAN_QUOTA = 400;
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
export const SPANISH_LANGS = ["spanish", "hawaiian"];
export const ARABIC_LANGS = ["arabic", "farsi", "pashto"];
export const OPEN_AI_MODELS = {
    GPT4o: "gpt-4o",
    GPT35Turbo: "gpt-3.5-turbo",
    DALL3: "dall-e-3",
    WHISPER: "whisper-1",
};
export const SEARCH_RESULTS_NUMBER = 5;
