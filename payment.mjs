import { COULDNT_RENEW_SUBSCRIPTION_MESSAGE, TOKENS_LIMIT_EXCEEDED_MESSAGE, GUMROAD_PAYMENT_URL } from './helpers/constants.mjs';
export const getNotAllowedMessage = (user) => {
    if  (user.isSubscribed) return TOKENS_LIMIT_EXCEEDED_MESSAGE;
    else if (user.hasSubscribed) return COULDNT_RENEW_SUBSCRIPTION_MESSAGE;
    else return getFreeTrialEndedMessage(user.userNumber) // User is in free trial
}

const getFreeTrialEndedMessage = (userNumber) => `Your free trial of WhatsApp AI Assistant has ended. Keep creating stickers 🎨, generating images 🖼️, and getting answers instantly by subscribing now!\n🔗 Pay here: ${GUMROAD_PAYMENT_URL}?userNumber=${userNumber}\nDon't miss out on the full experience! ✨`;

export const subsriptionNotificationsHandler = async (body) => {
    // TODO 
}

