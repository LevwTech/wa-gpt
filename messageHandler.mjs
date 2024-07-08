import _ from "lodash";
import uuid4 from "uuid4";
import axios from "axios";
import { getTextExtractor } from 'office-text-extractor'
import { FREE_STARTER_QUOTA, TEXT_TOKEN_COST, IMAGE_TOKEN_COST, STICKER_TOKEN_COST, RATE_LIMIT_ERROR_MESSAGE, PRO_PLAN_QUOTA } from "./helpers/constants.mjs";
import { checkCommandType, extractCommandPrompt, getCurrentUnixTime, hasBeen4Hours, getLanguage } from "./helpers/utils.mjs";
import { promptGPT, createImage, getAudioTranscription, needRealTimeInfo } from "./openAI.mjs";
import { saveMessage, getMessages } from "./dynamoDB/conversations.mjs";
import { saveUser, getUser } from "./dynamoDB/users.mjs";
import { getNotAllowedMessageBody, checkRenewal } from "./payment.mjs";
import sendMessage from "./sendMessage.mjs";
import MESSAGES from "./helpers/botMessages.mjs";
import { searchGoogle } from "./searchService.mjs";

const extractor = getTextExtractor()

export const handleMessage = async (body) => {
  const isStatusUpdateNotification = _.get(body, 'entry[0].changes[0].value.statuses[0].id', null);
  if (isStatusUpdateNotification) return;

  let { userName, userNumber, messageType, text } = extractMessageInfo(body);

  // If user sends a message that is not text or audio, we don't want to process it
  if (!['text', 'audio', 'document'].includes(messageType) || !userNumber) return;

  let lang = getLanguage(text);
  const user = await getUser(userNumber);
  if (!user) await addNewUser(userNumber, lang);
  await checkRenewal(user);

  let type;
  let messageBody;
  const isSubscribedToProPlan = user.isSubscribed && user.quota == PRO_PLAN_QUOTA;
  const isUserAllowed = user.usedTokens < user.quota
  const isInUnlimitedPlan = !isUserAllowed && isSubscribedToProPlan
  const isAudio = messageType == 'audio';
  const isDocument = messageType == 'document';
  let audioCost = 0;
  if (isDocument) {
    const documentId = _.get(body, 'entry[0].changes[0].value.messages[0].document.id', null);
    const caption = _.get(body, 'entry[0].changes[0].value.messages[0].document.caption', null);
    const { fileData } = await getFile(documentId);
    const fileText = await extractor.extractText({ input: fileData, type: 'buffer' })
    text = `Given this text: "${fileText}" Help with this: ${caption || 'Summarize.'}`
  }
  if (isAudio) {
    if (!isUserAllowed && !isSubscribedToProPlan) {
      await sendMessage(userNumber, 'interactive', getNotAllowedMessageBody(user, lang));
      await saveUserLang(user, userNumber, lang);
      return;
    }
    const audioId = _.get(body, 'entry[0].changes[0].value.messages[0].audio.id', null);
    const { fileData, fileExtension } = await getFile(audioId);
    const audioResponseObj = await getAudioTranscription(fileData, fileExtension);
    if (audioResponseObj === RATE_LIMIT_ERROR_MESSAGE) {
      await sendMessage(userNumber, 'text', { body: MESSAGES.RATE_LIMIT[lang] });
      await saveUserLang(user, userNumber, lang);
      return;
    }
    text = audioResponseObj.text;
    audioCost = audioResponseObj.cost;
    lang = getLanguage(text);
  }
  await saveMessage(userNumber, 'user', text);

  if (!isUserAllowed && !isSubscribedToProPlan) {
    type = 'interactive';
    messageBody = getNotAllowedMessageBody(user, lang);
  }
  else if (checkCommandType(text, 'image')) {
    if (isInUnlimitedPlan && !hasBeen4Hours(user.lastMediaGenerationTime)) {
      await sendMessage(userNumber, 'text', { body: MESSAGES.UNLIMITED_PLAN_RATE_LIMIT[lang] });
      await saveUserLang(user, userNumber, lang);
      return;
    }
    type = 'image';
    const imagePrompt = extractCommandPrompt(text, type);
    if (!imagePrompt) {
      await sendMessage(userNumber, 'text', { body: MESSAGES.IMAGE_WITHOUT_TEXT[user.lang]})
      return
    }
    const waitTextMessageBody = { body: MESSAGES.IMAGE_WAIT[lang] };
    await sendMessage(userNumber, 'text', waitTextMessageBody);
    const imageUrl = await createImage(imagePrompt);
    if (imageUrl === RATE_LIMIT_ERROR_MESSAGE) {
      messageBody = { body: MESSAGES.RATE_LIMIT[lang] }
      await sendMessage(userNumber, 'text', messageBody);
      await saveUserLang(user, userNumber, lang);
      return;
    }
    messageBody = {
      link: imageUrl,
    };
  }
  else if (checkCommandType(text, 'sticker')) {
    if (isInUnlimitedPlan && !hasBeen4Hours(user.lastMediaGenerationTime)) {
      await sendMessage(userNumber, 'text', { body: MESSAGES.UNLIMITED_PLAN_RATE_LIMIT[lang]});
      await saveUserLang(user, userNumber, lang);
      return;
    }
    type = 'sticker';
    const stickerPrompt = extractCommandPrompt(text, type);
    if (!stickerPrompt) {
      await sendMessage(userNumber, 'text', { body: MESSAGES.STICKER_WITHOUT_TEXT[user.lang]})
      return
    }
    const waitTextMessageBody = { body: MESSAGES.STICKER_WAIT[lang]};
    await sendMessage(userNumber, 'text', waitTextMessageBody);
    const stickerUrl = await createImage(stickerPrompt, true);
    if (stickerUrl === RATE_LIMIT_ERROR_MESSAGE) {
      messageBody = { body: MESSAGES.RATE_LIMIT[lang] };
      await sendMessage(userNumber, 'text', messageBody);
      await saveUserLang(user, userNumber, lang);
      return;
    }
    messageBody = {
      link: stickerUrl,
    };
  }
  else {
    type = 'text';
    const conversation = await getMessages(userNumber);
    const { isRealTime, searchTerm } = await needRealTimeInfo(conversation);
    if (isRealTime) {
      const searchResult = await searchGoogle(searchTerm);
      conversation.push({ role: "system", content: searchResult });
    }
    const gptResponse = await promptGPT(conversation, userName);
    if (gptResponse === RATE_LIMIT_ERROR_MESSAGE) {
      messageBody = { body: MESSAGES.RATE_LIMIT[lang] }
      await sendMessage(userNumber, 'text', messageBody);
      await saveUserLang(user, userNumber, lang);
      return;
    }
    messageBody = { body: gptResponse };
  }

  await sendMessage(userNumber, type, messageBody);

  if(!isUserAllowed && !isSubscribedToProPlan) return;
  switch (type) {
    case 'image':
      await saveUser(userNumber, user.usedTokens + IMAGE_TOKEN_COST, user.quota, user.isSubscribed, user.hasSubscribed, user.nextRenewalUnixTime, user.subscriptionId, getCurrentUnixTime(), lang);
      break;
    case 'sticker':
      await saveUser(userNumber, user.usedTokens + STICKER_TOKEN_COST, user.quota, user.isSubscribed, user.hasSubscribed, user.nextRenewalUnixTime, user.subscriptionId, getCurrentUnixTime(), lang);
      break;
    default:
      let textCost = user.isSubscribed ? TEXT_TOKEN_COST : TEXT_TOKEN_COST;
      if (isAudio) textCost += audioCost;
      await saveUser(userNumber, user.usedTokens + textCost, user.quota, user.isSubscribed, user.hasSubscribed, user.nextRenewalUnixTime, user.subscriptionId, user.lastMediaGenerationTime, lang);
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

const addNewUser = async (userNumber, lang) => {
  await saveUser(userNumber, 0, FREE_STARTER_QUOTA, false, false, 0, uuid4(), 0, lang);
  await sendMessage(userNumber, 'text', { body: MESSAGES.START_REPLY[lang] });
}

const getFile = async (fileId) => {
  const headers = {
    Authorization: `Bearer ${process.env.WHATSAPP_SYSTEM_ACCESS_TOKEN}`,
  };
  const fileResponse = await axios.get(
    `https://graph.facebook.com/v17.0/${fileId}`,
    { headers },
  );
  const fileMetaDataUrl = fileResponse.data.url
  const fileExtension = fileResponse?.data?.mime_type?.split('/')?.[1];
  const fileDataResponse = await axios.get(
    fileMetaDataUrl,
    { headers, responseType: 'arraybuffer' },
  );
  const fileData = fileDataResponse.data;
  return { fileData, fileExtension }
}

const saveUserLang = async (user, userNumber, lang) => {
  await saveUser(userNumber, user.usedTokens, user.quota, user.isSubscribed, user.hasSubscribed, user.nextRenewalUnixTime, user.subscriptionId, user.lastMediaGenerationTime, lang)
}