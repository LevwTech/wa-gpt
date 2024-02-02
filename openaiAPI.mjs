import axios from "axios";
import { OPEN_AI_SYSTEM_MESSAGE } from "./helpers/constants.mjs";

export const promptGPT = async (messages) => {
    const headers = {
        Authorization: `Bearer ${process.env.OPENAI_KEY}`,
      };
    const response = await axios.post(
        `https://api.openai.com/v1/chat/completions`,
        {
          messages: [OPEN_AI_SYSTEM_MESSAGE, ...messages],
          model: "gpt-3.5-turbo",
        },
        { headers },
    );
  return response.data.choices[0].message.content;
}