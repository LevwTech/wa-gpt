import { getBody, getAction, handleBadRequest, handleMessageReceived, headers, getWhatsAppBotUrl } from "./helpers/utils.mjs";
import { getWhatsAppBotUrl } from "./whatsAppBotInfo.mjs";
import { receiveMessage, verifyWhatsAppWebhook } from "./messageHandler.mjs";

export const handler = async (event, context, callback) => {
  try {
    const action = getAction(event);
    const body = getBody(event);
    const queryStringParams = event.queryStringParameters;
    let response;
    switch (action) {
      case "phone":
          response = getWhatsAppBotUrl();
          break;
      case "message":
          if (event.httpMethod === "GET") {
            response = verifyWhatsAppWebhook(queryStringParams);
            break;
          }
        await receiveMessage(body);
        return handleMessageReceived();
      default:  
        return handleBadRequest();
    }
    return {
      statusCode: 200,
      headers,
      body: response,
    };
  } catch (error) {
    const errorResponse = {
      status: "error",
      message: error.message,
      body: error
    };
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(errorResponse),
    };
  }
};


