// Create 3 gumroad tiers,
// 4.99 USD > 50 Tokens 3
// 14.99 USD > 200 Tokens (Default) 7
// 29.99 USD > 500 Tokens 10
import { FREE_TRIAL_ENDED_MESSAGE, COULDNT_RENEW_SUBSCRIPTION_MESSAGE, TOKENS_LIMIT_EXCEEDED_MESSAGE } from './helpers/constants.mjs';
export const getNotAllowedMessage = (user) => {
    if  (user.isSubscribed) return TOKENS_LIMIT_EXCEEDED_MESSAGE;
    else if (user.hasSubscribed) return COULDNT_RENEW_SUBSCRIPTION_MESSAGE;
    else return FREE_TRIAL_ENDED_MESSAGE // User is in free trial
}

export const subsriptionNotificationsHandler = async (body) => {
    // TODO listen for renewals, tier upgrades/downgrades and terminations and upgrade user's tokens and isSubscribed, hasSubscribed fields accordingly
}