import axios from "axios";
import { SUMMARIZE_SYSTEM_MESSAGE } from "./helpers/constants.mjs";

export const promptGPT = async (conversation, userName) => {
  const systemMessage = getSystemMessage(userName);
  const headers = {
    Authorization: `Bearer ${process.env.OPENAI_KEY}`,
  };
  const response = await axios.post(
      `https://api.openai.com/v1/chat/completions`,
      {
        messages: [systemMessage, ...conversation],
        model: "gpt-3.5-turbo",
      },
      { headers },
  );
  return response.data.choices[0].message.content;
}

export const promptGPTSummarize = async (conversation) => {
  const headers = {
    Authorization: `Bearer ${process.env.OPENAI_KEY}`,
  };
  const response = await axios.post(
      `https://api.openai.com/v1/chat/completions`,
      {
        messages: [...conversation, SUMMARIZE_SYSTEM_MESSAGE],
        model: "gpt-3.5-turbo",
      },
      { headers },
  );
  return [{ content: response.data.choices[0].message.content, role: "system"}]
}

const getSystemMessage = (userName) => {
  return {
    role: "system",
    content: `You are a helpful assistant inside WhatsApp, and you are currently assisting a person called ${userName}`
  }
}
