import axios from "axios";
import _ from "lodash";
import { getTTLByDays } from "./helpers/utils.mjs";

export const receiveMessage = async (body) => {
    // Extracting the needed info from WhatsApp's callback
    const isStatusUpdateNotification = _.get(body, 'entry[0].changes[0].value.statuses[0].id', null);
      if (isStatusUpdateNotification) return;
      const userName = _.get(body, 'entry[0].changes[0].value.contacts[0].profile.name','User Name');
      const userNumber = _.get(body, 'entry[0].changes[0].value.messages[0].from', 'User Number');
      const messageType = _.get(body, 'entry[0].changes[0].value.messages[0].type', null);
      const text = _.get(body, 'entry[0].changes[0].value.messages[0].text.body', null);
      // If user sends a message that is not text, we don't want to process it
      if (messageType !== 'text' || !text) {
        return;
      }
      // TODO check and save user in dynamoDB
      // TODO save message in dynamoDB
      const ttl = getTTLByDays(7) // messages will be deleted after 7 days
      const message = {
        text,
        ttl
      }
      const messageBody = { body: `Hello ${userName}, you said: ${text}` }
      await sendMessage(userNumber, 'text', messageBody);
}

export const verifyWhatsAppWebhook = (body) => {
    if (body['hub.mode'] === 'subscribe' && body['hub.verify_token'] === "verify_token")
    return body['hub.challenge'];    
    else 
        return {
            status: "error",
            message: "Invalid verify token"
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
    if (!metaMessageId) return;
    const ttl = getTTLByDays(7);
    const message = {
      text: type === 'text' ? messageBody.body : "Multi-media message",
      ttl
    };
    // TODO save message in dynamoDB
  }
