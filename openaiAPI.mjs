import axios from "axios";
import { SUMMARIZE_SYSTEM_MESSAGE, WHATSAPP_MAX_TEXT_LENGTH } from "./helpers/constants.mjs";
import { limitTextLength, generateStickerPrompt } from "./helpers/utils.mjs";
import { uploadImageToS3 } from "./imageUpoad.mjs";

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

export const createImage = async (prompt, isSticker) => {
  prompt = limitTextLength(prompt, 1000)
  prompt = isSticker ? generateStickerPrompt(prompt) : prompt;
  const response = await axios.post(
    `${openAIURL}/images/generations`,
      {
        prompt,
        size: isSticker ? "512x512" : "1024x1024",
      },
      { headers },
  );
  const url = response.data.data[0].url
  return isSticker ? await uploadImageToS3(url) : url
}

const getSystemMessage = (userName) => {
  return {
    role: "system",
    content: `You are a helpful assistant inside WhatsApp, and you are currently assisting a person called ${userName}. You can use emojis if you want to.`
  }
}
