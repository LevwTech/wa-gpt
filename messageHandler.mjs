import axios from "axios";
import _ from "lodash";
import { START_MESSAGE, START_MESSAGE_REPLY, IMAGE_WAIT_MESSAGE, STICKER_WAIT_MESSAGE } from "./helpers/constants.mjs";
import { checkIfMediaRequest, extractMediaRequestPrompt } from "./helpers/utils.mjs";
import { promptGPT, createImage } from "./openaiAPI.mjs";
import { saveMessage, getMessages } from "./dynamoDB/conversations.mjs";

export const receiveMessage = async (body) => {
  // Extracting the needed info from WhatsApp's callback
  const isStatusUpdateNotification = _.get(body, 'entry[0].changes[0].value.statuses[0].id', null);
  if (isStatusUpdateNotification) return;
  const userName = _.get(body, 'entry[0].changes[0].value.contacts[0].profile.name', 'UserName');
  const userNumber = _.get(body, 'entry[0].changes[0].value.messages[0].from', null);
  const messageType = _.get(body, 'entry[0].changes[0].value.messages[0].type', null);
  const text = _.get(body, 'entry[0].changes[0].value.messages[0].text.body', null);
  
  // If user sends a message that is not text, we don't want to process it
  if (messageType !== 'text' || !text || !userNumber) return;
  // TODO check and save user in dynamoDB
  await saveMessage(userNumber, 'user', text);
  if (checkIfMediaRequest(text, 'image')) {
    const imagePrompt = extractMediaRequestPrompt(text, 'image');
    const waitTextMessageBody = { body: IMAGE_WAIT_MESSAGE};
    await sendMessage(userNumber, 'text', waitTextMessageBody);
    const imageUrl = await createImage(imagePrompt);
    const messageBody = {
      link: imageUrl,
    };
    await sendMessage(userNumber, 'image', messageBody);
    return;
  }
  if (checkIfMediaRequest(text, 'sticker')) {
    const imagePrompt = extractMediaRequestPrompt(text, 'sticker');
    const waitTextMessageBody = { body: STICKER_WAIT_MESSAGE};
    await sendMessage(userNumber, 'text', waitTextMessageBody);
    const imageUrl = await createImage(imagePrompt, true);
    const messageBody = {
      link: imageUrl,
    };
    await sendMessage(userNumber, 'sticker', messageBody);
    return;
  }
  if (text === START_MESSAGE) {
    const messageBody = { body: START_MESSAGE_REPLY }
    await sendMessage(userNumber, 'text', messageBody);
    return;
  }
  const conversation = await getMessages(userNumber);
  const gptResponse = await promptGPT(conversation, userName);
  const messageBody = { body: gptResponse };
  await sendMessage(userNumber, 'text', messageBody);
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