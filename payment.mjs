import { COULDNT_RENEW_SUBSCRIPTION_MESSAGE, TOKENS_LIMIT_EXCEEDED_MESSAGE, GUMROAD_PAYMENT_URL } from './helpers/constants.mjs';
import { getUser, saveUser } from './dynamoDB/users.mjs';
import { getCurrentUnixTime, getNextRenewalUnixTime } from './helpers/utils.mjs';

export const getNotAllowedMessage = (user) => {
    if  (user.isSubscribed) return TOKENS_LIMIT_EXCEEDED_MESSAGE;
    else if (user.hasSubscribed) return COULDNT_RENEW_SUBSCRIPTION_MESSAGE;
    else return getFreeTrialEndedMessage(user.userNumber) // User is in free trial
}

const getFreeTrialEndedMessage = (userNumber) => `Your free trial of WhatsApp AI Assistant has ended. Keep creating stickers 🎨, generating images 🖼️, and getting answers instantly by subscribing now!\n🔗 Pay here: ${GUMROAD_PAYMENT_URL}?userNumber=${userNumber}\nDon't miss out on the full experience! ✨`;

export const subsriptionNotificationsHandler = async (body) => {
    // TODO 
    // sale or subscription_restarted => create user if not exist and update quota, usedTokens to 0, isSubscribed and hasSubscribed to true, and nextRenewalUnixTime to 30 days from now
    // subscription_updated upgrade => update quota
    // subscription_updated downgrade => update quota and handle other cases soon
    // subscription_ended  => update isSubscribed to false and usedTokens = quota
}
export const checkRenewal = async (user) => {
    if (user.isSubscribed && user.nextRenewalUnixTime != 0 && getCurrentUnixTime() > user.nextRenewalUnixTime) {
        await saveUser(user.userNumber, 0, user.quota, user.isSubscribed, user.hasSubscribed, getNextRenewalUnixTime(user.nextRenewalUnixTime));
    }
}
