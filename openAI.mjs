import axios from "axios";
import { SUMMARIZE_SYSTEM_MESSAGE, WHATSAPP_MAX_TEXT_LENGTH, DALLE_MAX_TEXT_LENGTH } from "./helpers/constants.mjs";
import { limitTextLength } from "./helpers/utils.mjs";
// import { limitTextLength, generateStickerPrompt } from "./helpers/utils.mjs";
import { getProcessedSticker } from "./imageService.mjs";

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
  prompt = isSticker ? await getGPTStickerPrompt(prompt) : prompt;
  const response = await axios.post(
    `${openAIURL}/images/generations`,
      {
        prompt,
        size: isSticker ? "512x512" : "1024x1024",
      },
      { headers },
  );
  const url = response.data.data[0].url
  return isSticker ? await getProcessedSticker(url) : url
}

const getSystemMessage = (userName) => {
  return {
    role: "system",
    content: `You are a helpful assistant inside WhatsApp, and you are currently assisting a person called ${userName}. You can use emojis if you want to.`
  }
}

// Here we prompt GPT to write the dalle prompt for the sticker, this proved to give better results
const getGPTStickerPrompt = async (prompt) => {
  const GptPromptToDalle = 'Give me a short dalle prompt not larger than 1000 characters to generate a sticker with a white stroke and a solid background, focus on visual descriptions. The sticker is: ' + prompt;
  const response = await axios.post(
      `${openAIURL}/chat/completions`,
      {
        messages: [{role: "system", content: GptPromptToDalle}],
        model: "gpt-3.5-turbo",
      },
      { headers },
  );
  const content = limitTextLength(response.data.choices[0].message.content, DALLE_MAX_TEXT_LENGTH)
  return content;
}
