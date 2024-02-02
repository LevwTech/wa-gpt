export const getBody = (event) => (event.body ? JSON.parse(event.body) : event.queryStringParameters);

export const getAction = (event) => event.path.split("/")[1];

export const getTTLByDays = (days) => Math.floor(Date.now() / 1000) + 60 * 60 * 24 * days;

export const handleBadRequest = () => ({
  statusCode: 400,
  body: "Bad Request",
});

export const headers = {
  "Content-Type": "application/json",
  Accept: "application/json",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "*",
  "X-Requested-With": "*",
  "Access-Control-Allow-Origin": "*",
};