import axios from "axios";

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

const getSystemMessage = (userName) => {
  return {
    role: "system",
    content: `You are a helpful assistant inside WhatsApp, and you are currently assisting a person called ${userName}`
  }
}
