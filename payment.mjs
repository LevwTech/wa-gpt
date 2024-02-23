import {  GUMROAD_UPDATE_SUBSCRIPTION_URL, GUMROAD_PAYMENT_URL, TIERS, GUMROAD_RESOURCE_TYPES, UNSUBSCRIBE_RESOURCE_TYPES, SUBSCRIBED_MESSAGE } from './helpers/constants.mjs';
import { getUserUsingSubscriptionId, saveUser } from './dynamoDB/users.mjs';
import { getCurrentUnixTime, getNextRenewalUnixTime } from './helpers/utils.mjs';
import sendMessage from './sendMessage.mjs';

export const getNotAllowedMessageBody = (user) => {
    if  (user.isSubscribed) return getTokensLimitExceededMessage(user.subscriptionId);
    else if (user.hasSubscribed) return getCouldntRenewSubscriptionMessage(user.subscriptionId);
    else return getFreeTrialEndedMessage(user.userNumber) // User is in free trial
}

const getFreeTrialEndedMessage = (userNumber) => {
    return {
        type: "cta_url",
        body: {
            text: "Your free trial of WhatsApp AI Assistant has ended. Keep creating stickers 🎨, generating images 🖼️, and getting answers instantly by subscribing now!"
        },
        footer: {
            text: "Don't miss out on the full experience! ✨"
        },
        action: {
            name: "cta_url",
            parameters: {
                display_text: "Subscribe Now",
                url: `${GUMROAD_PAYMENT_URL}?userNumber=${userNumber}`
            }
        }
    }
}

const getCouldntRenewSubscriptionMessage = (subscriptionId) => {
    return {
        type: "cta_url",
        body: {
            text: "I couldn't renew your subscription. Don't worry! You can still enjoy the features by resubscribing."
        },
        footer: {
            text: "Explore and enjoy the full experience! ✨"
        },
        action: {
            name: "cta_url",
            parameters: {
                display_text: "Renew Subscription",
                url: `${GUMROAD_UPDATE_SUBSCRIPTION_URL}/${subscriptionId}/manage`
            }
        }
    }

};

const getTokensLimitExceededMessage = (subscriptionId) => {
    return {
        type: "cta_url",
        body: {
            text: "You've used up all your sticker and image generations 🚀 To keep the creativity flowing, why not consider upgrading to a higher tier?"
        },
        footer: {
            text: "Explore and enjoy the full experience! ✨"
        },
        action: {
            name: "cta_url",
            parameters: {
                display_text: "Upgrade Subscription",
                url: `${GUMROAD_UPDATE_SUBSCRIPTION_URL}/${subscriptionId}/manage`
            }
        }
    }
};

export const subsriptionNotificationsHandler = async (body) => {
    if (!body) return;
    
    const subscriptionId = body.subscription_id;
    const userNumber = body.url_params?.userNumber;
    const tier = body.variants?.Tier;
    const quota = TIERS[tier];
    const isSale = body.resource_name == GUMROAD_RESOURCE_TYPES.SALE && userNumber;
    const isSubsriptionRestarted = body.resource_name == GUMROAD_RESOURCE_TYPES.SUBSCRIPTION_RESTARTED;
    const isSubsriptionUpdated = body.resource_name == GUMROAD_RESOURCE_TYPES.SUBSCRIPTION_UPDATED || body.resource_name == GUMROAD_RESOURCE_TYPES.SALE && !userNumber;
    const isSubsriptionEnded = UNSUBSCRIBE_RESOURCE_TYPES.includes(body.resource_name);

    if (isSale) {
        await saveUser(userNumber, 0, quota, true, true, getNextRenewalUnixTime(getCurrentUnixTime()), subscriptionId);
        await sendMessage(userNumber, 'text', { body: SUBSCRIBED_MESSAGE });
    }
    else if (isSubsriptionRestarted) {
        const user = await getUserUsingSubscriptionId(subscriptionId);
        await saveUser(user.userNumber, 0, quota || user.quota, true, true, getNextRenewalUnixTime(getCurrentUnixTime()), subscriptionId);
        await sendMessage(user.userNumber, 'text', { body: SUBSCRIBED_MESSAGE });
    }
    else if (isSubsriptionUpdated) {
        const user = await getUserUsingSubscriptionId(subscriptionId);
        const newTier = body.new_plan?.tier?.name
        const newQuota = TIERS[newTier];
        await saveUser(user.userNumber, user.usedTokens, newQuota || quota, true, true, user.nextRenewalUnixTime, subscriptionId);
    }
    else if (isSubsriptionEnded) {
        const user = await getUserUsingSubscriptionId(subscriptionId);
        await saveUser(user.userNumber, user.quota, user.quota, false, true, 0, subscriptionId);
    }
    else return;
}
export const checkRenewal = async (user) => {
    if (user.isSubscribed && user.nextRenewalUnixTime != 0 && getCurrentUnixTime() > user.nextRenewalUnixTime) {
        await saveUser(user.userNumber, 0, user.quota, user.isSubscribed, user.hasSubscribed, getNextRenewalUnixTime(user.nextRenewalUnixTime), user.subscriptionId);
    }
}
