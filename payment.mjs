import _ from 'lodash';
import {  GUMROAD_UPDATE_SUBSCRIPTION_URL, GUMROAD_PAYMENT_URL, TIERS, GUMROAD_RESOURCE_TYPES, UNSUBSCRIBE_RESOURCE_TYPES } from './helpers/constants.mjs';
import { getUserUsingSubscriptionId, saveUser } from './dynamoDB/users.mjs';
import { getCurrentUnixTime, getNextRenewalUnixTime } from './helpers/utils.mjs';
import sendMessage from './sendMessage.mjs';
import MESSAGES from './helpers/botMessages.mjs';

export const getNotAllowedMessageBody = (user, lang) => {
    if  (user.isSubscribed) return getTokensLimitExceededMessage(user.subscriptionId, lang || user.lang);
    else if (user.hasSubscribed) return getCouldntRenewSubscriptionMessage(user.subscriptionId, lang || user.lang);
    else return getFreeTrialEndedMessage(user.userNumber, lang || user.lang);
}

const getFreeTrialEndedMessage = (userNumber, lang) => {
    return {
        type: "cta_url",
        body: {
            text: MESSAGES.FREE_TRIAL_ENDED[lang]
        },
        footer: {
            text: MESSAGES.ENJOY_FOOTER_1[lang]
        },
        action: {
            name: "cta_url",
            parameters: {
                display_text: MESSAGES.SUBSCRIBE_BTN[lang],
                url: `${GUMROAD_PAYMENT_URL}-${lang}?userNumber=${userNumber}`
            }
        }
    }
}

const getCouldntRenewSubscriptionMessage = (subscriptionId, lang) => {
    return {
        type: "cta_url",
        body: {
            text: MESSAGES.COULDNT_RENEW[lang]
        },
        footer: {
            text: MESSAGES.ENJOY_FOOTER_2[lang]
        },
        action: {
            name: "cta_url",
            parameters: {
                display_text: MESSAGES.RENEW_BTN[lang],
                url: `${GUMROAD_UPDATE_SUBSCRIPTION_URL}/${subscriptionId}/manage`
            }
        }
    }

};

const getTokensLimitExceededMessage = (subscriptionId, lang) => {
    return {
        type: "cta_url",
        body: {
            text: MESSAGES.TOKENS_ENXCEEDED[lang]
        },
        footer: {
            text: MESSAGES.ENJOY_FOOTER_2[lang]
        },
        action: {
            name: "cta_url",
            parameters: {
                display_text: MESSAGES.UPGRADE_BTN[lang],
                url: `${GUMROAD_UPDATE_SUBSCRIPTION_URL}/${subscriptionId}/manage`
            }
        }
    }
};

export const subsriptionNotificationsHandler = async (body) => {
    if (!body) return;
    
    const subscriptionId = body.subscription_id;
    const userNumber = _.get(body, 'url_params.userNumber', null);
    const tier = _.get(body, 'variants.Tier', null);
    const quota = TIERS[tier];
    const isSale = body.resource_name == GUMROAD_RESOURCE_TYPES.SALE && userNumber;
    const isSubsriptionRestarted = body.resource_name == GUMROAD_RESOURCE_TYPES.SUBSCRIPTION_RESTARTED;
    const isSubsriptionUpdated = body.resource_name == GUMROAD_RESOURCE_TYPES.SUBSCRIPTION_UPDATED;
    const isSubsriptionEnded = UNSUBSCRIBE_RESOURCE_TYPES.includes(body.resource_name);

    if (isSale) {
        await saveUser(userNumber, 0, quota, true, true, getNextRenewalUnixTime(getCurrentUnixTime()), subscriptionId, 0, "en");
        await sendMessage(userNumber, 'text', { body: MESSAGES.SUBSCRIBED.en });
    }
    else if (isSubsriptionRestarted) {
        const user = await getUserUsingSubscriptionId(subscriptionId);
        await saveUser(user.userNumber, 0, quota || user.quota, true, true, getNextRenewalUnixTime(getCurrentUnixTime()), subscriptionId, user.lastMediaGenerationTime, user.lang);
        await sendMessage(user.userNumber, 'text', { body: MESSAGES.SUBSCRIBED[user.lang] });
    }
    else if (isSubsriptionUpdated) {
        const user = await getUserUsingSubscriptionId(subscriptionId);
        const newTier = _.get(body, 'new_plan.tier.name', null);
        const newQuota = TIERS[newTier];
        await saveUser(user.userNumber, user.usedTokens, newQuota, true, true, user.nextRenewalUnixTime, subscriptionId, user.lastMediaGenerationTime, user.lang);
        await sendMessage(user.userNumber, 'text', { body: MESSAGES.UPGRADED_SUBSCRIPTION[user.lang] });
    }
    else if (isSubsriptionEnded) {
        const user = await getUserUsingSubscriptionId(subscriptionId);
        await saveUser(user.userNumber, user.quota, user.quota, false, true, 0, subscriptionId, user.lastMediaGenerationTime, user.lang);
    }
    else return;
}
export const checkRenewal = async (user) => {
    if (user.isSubscribed && user.nextRenewalUnixTime != 0 && getCurrentUnixTime() > user.nextRenewalUnixTime) {
        let nextRenewalUnixTime = getNextRenewalUnixTime(user.nextRenewalUnixTime);
        while (getCurrentUnixTime() > nextRenewalUnixTime) {
            nextRenewalUnixTime = getNextRenewalUnixTime(nextRenewalUnixTime);
        }
        await saveUser(user.userNumber, 0, user.quota, user.isSubscribed, user.hasSubscribed, nextRenewalUnixTime, user.subscriptionId, user.lastMediaGenerationTime, user.lang);
    }
}
