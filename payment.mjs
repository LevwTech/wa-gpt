import {  GUMROAD_UPDATE_SUBSCRIPTION_URL, GUMROAD_PAYMENT_URL } from './helpers/constants.mjs';
import { getUser, saveUser } from './dynamoDB/users.mjs';
import { getCurrentUnixTime, getNextRenewalUnixTime } from './helpers/utils.mjs';

export const getNotAllowedMessage = (user) => {
    if  (user.isSubscribed) return getTokensLimitExceededMessage(user.subscriptionId);
    else if (user.hasSubscribed) return getCouldntRenewSubscriptionMessage(user.subscriptionId);
    else return getFreeTrialEndedMessage(user.userNumber) // User is in free trial
}

const getFreeTrialEndedMessage = (userNumber) => `Your free trial of WhatsApp AI Assistant has ended. Keep creating stickers 🎨, generating images 🖼️, and getting answers instantly by subscribing now!\n🔗 Pay here: ${GUMROAD_PAYMENT_URL}?userNumber=${userNumber}\nDon't miss out on the full experience! ✨`;

const getCouldntRenewSubscriptionMessage = (subscriptionId) => `I couldn't renew your subscription. Don't worry! You can still enjoy the features by resubscribing.\n🔗 Renew your subscription here: ${GUMROAD_UPDATE_SUBSCRIPTION_URL}/${subscriptionId}/manage \nExplore and enjoy the full experience! ✨`;

const getTokensLimitExceededMessage = (subscriptionId) => `Hey there! It looks like you've used up all your sticker and image generations 🚀. To keep the creativity flowing, why not consider upgrading to a higher tier?\nYou can easily upgrade by visiting ${GUMROAD_UPDATE_SUBSCRIPTION_URL}/${subscriptionId}/manage `;

export const subsriptionNotificationsHandler = async (body) => {
    // TODO 
    // sale or subscription_restarted => create user if not exist and update quota, usedTokens to 0, isSubscribed and hasSubscribed to true, and nextRenewalUnixTime to 30 days from now
    // subscription_updated upgrade => update quota
    // subscription_ended, cancelled, refund  => update isSubscribed to false and usedTokens = quota
}
export const checkRenewal = async (user) => {
    if (user.isSubscribed && user.nextRenewalUnixTime != 0 && getCurrentUnixTime() > user.nextRenewalUnixTime) {
        await saveUser(user.userNumber, 0, user.quota, user.isSubscribed, user.hasSubscribed, getNextRenewalUnixTime(user.nextRenewalUnixTime), user.subscriptionId);
    }
}
