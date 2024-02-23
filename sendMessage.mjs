import axios from 'axios';
import _ from 'lodash';
import { saveMessage } from './dynamoDB/conversations.mjs';

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

  export default sendMessage;