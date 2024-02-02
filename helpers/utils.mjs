export const getBody = (event) => (JSON.parse(event.body));

export const getAction = (event) => event.path.split("/")[1];

export const getTTLByDays = (days) => Math.floor(Date.now() / 1000) + 60 * 60 * 24 * days;

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