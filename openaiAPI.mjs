import axios from "axios";
import { SUMMARIZE_SYSTEM_MESSAGE } from "./helpers/constants.mjs";
import { limitTextLength } from "./helpers/utils.mjs";
import { WHATSAPP_MAX_TEXT_LENGTH } from "./helpers/constants.mjs";

const headers = {
  Authorization: `Bearer ${process.env.OPENAI_KEY}`,
};
const openAIURL = "https://api.openai.com/v1";

export const promptGPT = async (conversation, userName) => {
  const systemMessage = getSystemMessage(userName);
  const response = await axios.post(
    `${openAIURL}/chat/completions`,
      {
        messages: [systemMessage, ...conversation],
        model: "gpt-3.5-turbo",
      },
      { headers },
  );
  const content = limitTextLength(response.data.choices[0].message.content, WHATSAPP_MAX_TEXT_LENGTH)
  return content;
}

export const promptGPTSummarize = async (conversation) => {
  const response = await axios.post(
      `${openAIURL}/chat/completions`,
      {
        messages: [...conversation, SUMMARIZE_SYSTEM_MESSAGE],
        model: "gpt-3.5-turbo",
      },
      { headers },
  );
  return [{ content: response.data.choices[0].message.content, role: "system"}]
}

export const createImage = async (prompt) => {
  prompt = limitTextLength(prompt, 1000)
  const response = await axios.post(
    `${openAIURL}/images/generations`,
      {
        prompt
      },
      { headers },
  );
  return response.data.data[0].url
}

const getSystemMessage = (userName) => {
  return {
    role: "system",
    content: `You are a helpful assistant inside WhatsApp, and you are currently assisting a person called ${userName}`
  }
}
