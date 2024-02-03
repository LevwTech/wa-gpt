import axios from "axios";
import { SUMMARIZE_SYSTEM_MESSAGE } from "./helpers/constants.mjs";
import { limitTextLength } from "./helpers/utils.mjs";

const headers = {
  Authorization: `Bearer ${process.env.OPENAI_KEY}`,
};
const openAIURL = "https://api.openai.com/v1/chat/completions";

export const promptGPT = async (conversation, userName) => {
  const systemMessage = getSystemMessage(userName);
  const response = await axios.post(
      openAIURL,
      {
        messages: [systemMessage, ...conversation],
        model: "gpt-3.5-turbo",
      },
      { headers },
  );
  if (response.data.error?.message) throw new Error(response.data.error.message);
  const content = limitTextLength(response.data.choices[0].message.content)
  return content;
}

export const promptGPTSummarize = async (conversation) => {
  const response = await axios.post(
      openAIURL,
      {
        messages: [...conversation, SUMMARIZE_SYSTEM_MESSAGE],
        model: "gpt-3.5-turbo",
      },
      { headers },
  );
  if (response.data.error?.message) throw new Error(response.data.error.message);
  return [{ content: response.data.choices[0].message.content, role: "system"}]
}

const getSystemMessage = (userName) => {
  return {
    role: "system",
    content: `You are a helpful assistant inside WhatsApp, and you are currently assisting a person called ${userName}`
  }
}
