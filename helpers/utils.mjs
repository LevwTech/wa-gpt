import { MESSAGES_DAYS_TILL_EXPIRATION } from "./constants.mjs";

export const getAction = (event) => event.path.split("/")[1];

export const getBody = (event) => JSON.parse(event.body);

export const getTTL = () => Math.floor(Date.now() / 1000) + 60 * 60 * 24 * MESSAGES_DAYS_TILL_EXPIRATION;

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