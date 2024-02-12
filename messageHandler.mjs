import axios from "axios";
import _ from "lodash";
import { START_MESSAGE, START_MESSAGE_REPLY, IMAGE_WAIT_MESSAGE, STICKER_WAIT_MESSAGE, STARTER_TOKENS_COUNT, TEXT_TOKEN_COST, IMAGE_TOKEN_COST, STICKER_TOKEN_COST, DALLE_RATE_LIMIT_ERROR_MESSAGE, DALLE_DEFAULT_ERROR_MESSAGE, RATE_LIMIT_MESSAGE } from "./helpers/constants.mjs";
import { checkIfMediaRequest, extractMediaRequestPrompt } from "./helpers/utils.mjs";
import { promptGPT, createImage } from "./openAI.mjs";
import { saveMessage, getMessages } from "./dynamoDB/conversations.mjs";
import { saveUser, getUser } from "./dynamoDB/users.mjs";

export const receiveMessage = async (body) => {
  const isStatusUpdateNotification = _.get(body, 'entry[0].changes[0].value.statuses[0].id', null);
  if (isStatusUpdateNotification) return;
  const { userName, userNumber, messageType, text } = extractMessageInfo(body);
  // If user sends a message that is not text, we don't want to process it
  if (messageType !== 'text' || !text || !userNumber) return;
  const user = await getUser(userNumber);
  if (!user) await saveUser(userNumber, STARTER_TOKENS_COUNT, false, false);
  await saveMessage(userNumber, 'user', text);
  let type;
  let messageBody;
  const isUserAllowed = user.tokensCount > 0 || user.isSubscribed;
  if (!isUserAllowed) {
    type = 'text';
    // messageBody.body = user.hasSubscribed ? getSubscribeMessage() : getFreeTrialEndedMessage(); // TODO
    messageBody = { body: "You have no more tokens left. Please buy more tokens." }
  }
  else if (checkIfMediaRequest(text, 'image')) {
    type = 'image';
    const imagePrompt = extractMediaRequestPrompt(text, type);
    const waitTextMessageBody = { body: IMAGE_WAIT_MESSAGE};
    await sendMessage(userNumber, 'text', waitTextMessageBody);
    const imageUrl = await createImage(imagePrompt);
    if (imageUrl === DALLE_RATE_LIMIT_ERROR_MESSAGE) {
      messageBody = { body: RATE_LIMIT_MESSAGE }
      await sendMessage(userNumber, 'text', messageBody);
      return;
    }
    if (imageUrl === DALLE_DEFAULT_ERROR_MESSAGE) {
      throw new Error(DALLE_DEFAULT_ERROR_MESSAGE)
    }
    messageBody = {
      link: imageUrl,
    };
  }
  else if (checkIfMediaRequest(text, 'sticker')) {
    type = 'sticker';
    const stickerPrompt = extractMediaRequestPrompt(text, type);
    const waitTextMessageBody = { body: STICKER_WAIT_MESSAGE};
    await sendMessage(userNumber, 'text', waitTextMessageBody);
    const stickerUrl = await createImage(stickerPrompt, true);
    if (stickerUrl === DALLE_RATE_LIMIT_ERROR_MESSAGE) {
      messageBody = { body: RATE_LIMIT_MESSAGE }
      await sendMessage(userNumber, 'text', messageBody);
      return;
    }
    if (stickerUrl === DALLE_DEFAULT_ERROR_MESSAGE) {
      throw new Error(DALLE_DEFAULT_ERROR_MESSAGE)
    }
    messageBody = {
      link: stickerUrl,
    };
  }
  else if (text === START_MESSAGE) {
    type = 'text';
    messageBody = { body: START_MESSAGE_REPLY }
  }
  else {
    type = 'text';
    const conversation = await getMessages(userNumber);
    const gptResponse = await promptGPT(conversation, userName);
    messageBody = { body: gptResponse };
  }
  await sendMessage(userNumber, type, messageBody);
  if(!isUserAllowed || text === START_MESSAGE) return;
  switch (type) {
    case 'text':
      await saveUser(userNumber, user.tokensCount - TEXT_TOKEN_COST, user.isSubscribed, user.hasSubscribed);
      break;
    case 'image':
      await saveUser(userNumber, user.tokensCount - IMAGE_TOKEN_COST, user.isSubscribed, user.hasSubscribed);
      break;
    case 'sticker':
      await saveUser(userNumber, user.tokensCount - STICKER_TOKEN_COST, user.isSubscribed, user.hasSubscribed);
      break;
    default:
      break;
  }
}

const sendMessage =  async (to, type, messageBody) => {
  const headers = {
    Authorization: `Bearer ${process.env.WHATSAPP_SYSTEM_ACCESS_TOKEN}`,
  };
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const messageParams = {
    messaging_product: 'whatsapp',
    to,
    recipient_type: 'individual',
    type,
    [type]: messageBody,
  };
  const messageSentResponse = await axios.post(
    `https://graph.facebook.com/v17.0/${phoneNumberId}/messages`,
    messageParams,
    { headers },
  );
  const metaMessageId = _.get(messageSentResponse, 'data.messages[0].id', null);
  if (!metaMessageId) throw new Error('Error sending message');
  await saveMessage(to, 'assistant', type === 'text' ? messageBody.body : "Multi-media message");
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