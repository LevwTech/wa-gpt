import axios from "axios";
import _ from "lodash";
import fs from 'fs';
import { SUMMARIZE_SYSTEM_MESSAGE, WHATSAPP_MAX_TEXT_LENGTH, DALLE_MAX_TEXT_LENGTH, RATE_LIMIT_ERROR_MESSAGE, AUDIO_TOKEN_COST_PER_MINUTE, OPEN_AI_MODELS } from "./helpers/constants.mjs";
import { limitTextLength } from "./helpers/utils.mjs";
// import { limitTextLength, generateStickerPrompt } from "./helpers/utils.mjs";
import { getProcessedSticker } from "./imageService.mjs";

const headers = {
  Authorization: `Bearer ${process.env.OPENAI_KEY}`,
};
const openAIURL = "https://api.openai.com/v1";

export const promptGPT = async (conversation, userName) => {
  try {
    const systemMessage = getSystemMessage(userName);
    const response = await axios.post(
      `${openAIURL}/chat/completions`,
      {
        messages: [systemMessage, ...conversation],
        model: OPEN_AI_MODELS.GPT4o,
      },
      { headers },
    );
    const content = limitTextLength(response.data.choices[0].message.content, WHATSAPP_MAX_TEXT_LENGTH);
    return content;
  } catch (error) {
    const errorMessage = _.get(error, "response.data.error.code", null);
    if (errorMessage === RATE_LIMIT_ERROR_MESSAGE) return errorMessage;
    else throw new Error(error)
  }
}

export const promptGPTSummarize = async (conversation) => {
  const response = await axios.post(
      `${openAIURL}/chat/completions`,
      {
        messages: [...conversation, SUMMARIZE_SYSTEM_MESSAGE],
        model: OPEN_AI_MODELS.GPT35Turbo,
      },
      { headers },
  );
  return [{ content: response.data.choices[0].message.content, role: "system"}]
}

export const createImage = async (prompt, isSticker) => {
  try {
    prompt = limitTextLength(prompt, DALLE_MAX_TEXT_LENGTH);
    prompt = await getGPTImagePrompt(prompt, isSticker);
    const response = await axios.post(
      `${openAIURL}/images/generations`,
      {
        model: OPEN_AI_MODELS.DALL3,
        prompt,
      },
      { headers }
    );
    const url = response.data.data[0].url;
    return isSticker ? await getProcessedSticker(url) : url;
  } catch (error) {
    const errorMessage = _.get(error, "response.data.error.code", null);
    if (errorMessage === RATE_LIMIT_ERROR_MESSAGE) return errorMessage;
    else throw new Error(error)
  }
};

const getSystemMessage = (userName, isSticker) => {
  return {
    role: "system",
    content: `You are a helpful assistant inside WhatsApp, and you are currently assisting a person called ${userName}. You can use emojis if you want to. If a user wants to generate a sticker ask them to use the /sticker command followed by the sticker description, and if a user wants to generate an image ask them to use the /image command followed by the image description. Keep your answers straightforward and short. If a user sents a voice note, you can process it and respond accordingly. If a user uploads a file, you can summarize it and answer any question about it.`
  }
}

// Here we prompt GPT to write the dalle prompt for the image, this proved to give better results
const getGPTImagePrompt = async (prompt, isSticker) => {
  try {
    const GptPromptToDalleSticker = 'Give me a short dalle prompt not larger than 4000 characters to generate a sticker with a white stroke and a solid background, focus on visual descriptions. The sticker is: ' + prompt;
    const GptPromptToDalleImage = 'Give me a short dalle prompt not larger than 4000 characters to generate a high quality, high resolution, detailed, 4k, 8k image ' + prompt;
    const response = await axios.post(
      `${openAIURL}/chat/completions`,
      {
        messages: [{role: "system", content: isSticker ?  GptPromptToDalleSticker : GptPromptToDalleImage}],
        model: OPEN_AI_MODELS.GPT4o,
      },
      { headers },
    );
    const content = limitTextLength(response.data.choices[0].message.content, DALLE_MAX_TEXT_LENGTH);
    return content;
  } catch (error) {
    // If something was wrong with the request, we return the original prompt
    return prompt;
  }
}

export const getAudioTranscription = async (data, extension) => {
  try {
    const tempFilePath = `/tmp/audio.${extension}`;
    fs.writeFileSync(tempFilePath, data);
    const audioHeaders = {
      ...headers,
      "Content-Type": "multipart/form-data",
    }
    const response = await axios.post(`${openAIURL}/audio/transcriptions`, 
    {
      file: fs.createReadStream(tempFilePath),
      model: OPEN_AI_MODELS.WHISPER,
      response_format: "verbose_json"
    }, 
    { headers: audioHeaders });
    fs.unlinkSync(tempFilePath);  
    const text = limitTextLength(response.data.text, WHATSAPP_MAX_TEXT_LENGTH);
    const duration = response.data.duration;
    const cost = (duration / 60) * AUDIO_TOKEN_COST_PER_MINUTE;
    return { text, cost };
  } catch (error) {
    const errorMessage = _.get(error, "response.data.error.code", null);
    if (errorMessage === RATE_LIMIT_ERROR_MESSAGE) return errorMessage;
    else throw new Error(error)
  }
}

export const needRealTimeInfo = async (conversation) => {
  try {
    const response = await axios.post(
      `${openAIURL}/chat/completions`,
      {
        messages: [
          {
            role: "system",
            content: "Analyze the conversation and determine if the user's question requires real-time information. Respond with a JSON object containing 'isRealTime' (boolean) and 'searchTerm' (string)."
          },
          ...conversation
        ],
        model: OPEN_AI_MODELS.GPT4o,
        function_call: { name: "determine_real_time_need" },
        functions: [
          {
            name: "determine_real_time_need",
            description: "Analyze the conversation to determine if the user's question requires up-to-date or real-time information that may not be in the AI's knowledge base. If so, extract or formulate an appropriate search term to find this information. Consider factors such as questions about current events, recent developments, live data (e.g., weather, stocks, sports' matches scores), or any topic that might have changed since the AI's last update.",
            parameters: {
              type: "object",
              properties: {
                isRealTime: {
                  type: "boolean",
                  description: "Indicates if the question requires real-time information"
                },
                searchTerm: {
                  type: "string",
                  description: "The search term to be used if real-time information is needed"
                }
              },
              required: ["isRealTime", "searchTerm"]
            }
          }
        ]
      },
      { headers }
    );

    const result = JSON.parse(response.data.choices[0].message.function_call.arguments);
    return result;
  } catch (error) {
    console.error("Error in needRealTimeInfo:", error);
    return { isRealTime: false, searchTerm: "" };
  }
};
