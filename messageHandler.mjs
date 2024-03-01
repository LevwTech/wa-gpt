import _ from "lodash";
import uuid4 from "uuid4";
import axios from "axios";
import { START_MESSAGE_REPLY, IMAGE_WAIT_MESSAGE, STICKER_WAIT_MESSAGE, FREE_STARTER_QUOTA, TEXT_TOKEN_COST, IMAGE_TOKEN_COST, STICKER_TOKEN_COST, RATE_LIMIT_ERROR_MESSAGE, RATE_LIMIT_MESSAGE, TEXT_TOKEN_COST_FREE, PRO_PLAN_QUOTA, UNLIMITED_PLAN_RATE_LIMIT } from "./helpers/constants.mjs";
import { checkIfMediaRequest, extractMediaRequestPrompt, getCurrentUnixTime, hasBeen4Hours } from "./helpers/utils.mjs";
import { promptGPT, createImage, getAudioTranscription } from "./openAI.mjs";
import { saveMessage, getMessages } from "./dynamoDB/conversations.mjs";
import { saveUser, getUser } from "./dynamoDB/users.mjs";
import { getNotAllowedMessageBody, checkRenewal } from "./payment.mjs";
import sendMessage from "./sendMessage.mjs";

export const handleMessage = async (body) => {
  const isStatusUpdateNotification = _.get(body, 'entry[0].changes[0].value.statuses[0].id', null);
  if (isStatusUpdateNotification) return;

  let { userName, userNumber, messageType, text } = extractMessageInfo(body);

  // If user sends a message that is not text or audio, we don't want to process it
  if (!['text', 'audio'].includes(messageType)|| !userNumber) return;

  const user = await getUser(userNumber);
  if (!user) await addNewUser(userNumber);

  const isAudio = messageType == 'audio';
  let audioCost = 0;

  await checkRenewal(user);

  if (isAudio) {
    const audioId = _.get(body, 'entry[0].changes[0].value.messages[0].audio.id', null);
    const audioFile = await getAudioFile(audioId);
    const audioResponseObj = await getAudioTranscription(audioFile);
    if (audioResponseObj === RATE_LIMIT_ERROR_MESSAGE) {
      await sendMessage(userNumber, 'text', { body: RATE_LIMIT_MESSAGE });
      return;
    }
    text = audioResponseObj.text;
    audioCost = audioResponseObj.cost;
  }
  await saveMessage(userNumber, 'user', text);

  let type;
  let messageBody;
  const isSubscribedToProPlan = user.isSubscribed && user.quota == PRO_PLAN_QUOTA;
  const isUserAllowed = user.usedTokens < user.quota
  const isInUnlimitedPlan = !isUserAllowed && isSubscribedToProPlan

  if (!isUserAllowed && !isSubscribedToProPlan) {
    type = 'interactive';
    messageBody = getNotAllowedMessageBody(user);
  }
  else if (checkIfMediaRequest(text, 'image')) {
    if (isInUnlimitedPlan && !hasBeen4Hours(user.lastMediaGenerationTime)) {
      await sendMessage(userNumber, 'text', { body: UNLIMITED_PLAN_RATE_LIMIT});
      return;
    }
    type = 'image';
    const imagePrompt = extractMediaRequestPrompt(text, type);
    const waitTextMessageBody = { body: IMAGE_WAIT_MESSAGE};
    await sendMessage(userNumber, 'text', waitTextMessageBody);
    const imageUrl = await createImage(imagePrompt);
    if (imageUrl === RATE_LIMIT_ERROR_MESSAGE) {
      messageBody = { body: RATE_LIMIT_MESSAGE }
      await sendMessage(userNumber, 'text', messageBody);
      return;
    }
    messageBody = {
      link: imageUrl,
    };
  }
  else if (checkIfMediaRequest(text, 'sticker')) {
    if (isInUnlimitedPlan && !hasBeen4Hours(user.lastMediaGenerationTime)) {
      await sendMessage(userNumber, 'text', { body: UNLIMITED_PLAN_RATE_LIMIT});
      return;
    }
    type = 'sticker';
    const stickerPrompt = extractMediaRequestPrompt(text, type);
    const waitTextMessageBody = { body: STICKER_WAIT_MESSAGE};
    await sendMessage(userNumber, 'text', waitTextMessageBody);
    const stickerUrl = await createImage(stickerPrompt, true);
    if (stickerUrl === RATE_LIMIT_ERROR_MESSAGE) {
      messageBody = { body: RATE_LIMIT_MESSAGE }
      await sendMessage(userNumber, 'text', messageBody);
      return;
    }
    messageBody = {
      link: stickerUrl,
    };
  }
  else {
    type = 'text';
    const conversation = await getMessages(userNumber);
    const gptResponse = await promptGPT(conversation, userName);
    if (gptResponse === RATE_LIMIT_ERROR_MESSAGE) {
      messageBody = { body: RATE_LIMIT_MESSAGE }
      await sendMessage(userNumber, 'text', messageBody);
      return;
    }
    messageBody = { body: gptResponse };
  }

  await sendMessage(userNumber, type, messageBody);

  if(!isUserAllowed && !isSubscribedToProPlan) return;
  switch (type) {
    case 'image':
      await saveUser(userNumber, user.usedTokens + IMAGE_TOKEN_COST, user.quota, user.isSubscribed, user.hasSubscribed, user.nextRenewalUnixTime, user.subscriptionId, getCurrentUnixTime());
      break;
    case 'sticker':
      await saveUser(userNumber, user.usedTokens + STICKER_TOKEN_COST, user.quota, user.isSubscribed, user.hasSubscribed, user.nextRenewalUnixTime, user.subscriptionId, getCurrentUnixTime());
      break;
    default:
      let textCost = user.isSubscribed ? TEXT_TOKEN_COST : TEXT_TOKEN_COST_FREE;
      if (isAudio) textCost += audioCost;
      await saveUser(userNumber, user.usedTokens + textCost, user.quota, user.isSubscribed, user.hasSubscribed, user.nextRenewalUnixTime, user.subscriptionId, user.lastMediaGenerationTime);
      break;
  }
}

export const verifyWhatsAppWebhook = (query) => {
  if (query['hub.mode'] === 'subscribe' && query['hub.verify_token'] === "verify_token")
    return query['hub.challenge'];    
}

const extractMessageInfo = (body) => {
  const userName = _.get(body, 'entry[0].changes[0].value.contacts[0].profile.name', 'UserName');
  const userNumber = _.get(body, 'entry[0].changes[0].value.messages[0].from', null);
  const messageType = _.get(body, 'entry[0].changes[0].value.messages[0].type', null);
  const text = _.get(body, 'entry[0].changes[0].value.messages[0].text.body', null);
  return { userName, userNumber, messageType, text}
};

const addNewUser = async (userNumber) => {
  await saveUser(userNumber, 0, FREE_STARTER_QUOTA, false, false, 0, uuid4(), 0);
  await sendMessage(userNumber, 'text', { body: START_MESSAGE_REPLY });
}

const getAudioFile = async (audioId) => {
  const headers = {
    Authorization: `Bearer ${process.env.WHATSAPP_SYSTEM_ACCESS_TOKEN}`,
  };
  const mediaResponse = await axios.get(
    `https://graph.facebook.com/v17.0/${audioId}`,
    { headers },
  );
  const mediaMetaDataUrl = mediaResponse.data.url
  const mediaDataResponse = await axios.get(
    mediaMetaDataUrl,
    { headers, responseType: 'arraybuffer' },
  );
  return mediaDataResponse.data
}