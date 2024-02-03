export const getAction = (event) => event.path.split("/")[1];

export const getBody = (event) => JSON.parse(event.body);


export const handleBadRequest = () => ({
  statusCode: 400,
  body: "Bad Request",
});

export const handleMessageReceived = () => ({
  statusCode: 200,
  body: "Message Received",
});

export const headers = {
  "Content-Type": "application/json",
  Accept: "application/json",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "*",
  "X-Requested-With": "*",
  "Access-Control-Allow-Origin": "*",
};

export const limitTextLength = (text) => {
  const WHATSAPP_MAX_LENGTH = 4096;
  if (text.length > WHATSAPP_MAX_LENGTH) {
      return text.substring(0, WHATSAPP_MAX_LENGTH);
  } else {
      return text;
  }
}