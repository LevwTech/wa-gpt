import { getBody, getAction, handleBadRequest, handleNotificationReceived, headers, getWhatsAppBotUrl } from "./helpers/utils.mjs";
import { receiveMessage, verifyWhatsAppWebhook } from "./messageHandler.mjs";
import { subsriptionNotificationsHandler } from "./payment.mjs";

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
          if (event.requestContext?.http?.method === "GET") {
            response = verifyWhatsAppWebhook(queryStringParams);
            break;
          }
        await receiveMessage(body);
        return handleNotificationReceived();
      case "subscription":
        await subsriptionNotificationsHandler(body);
        return handleNotificationReceived();
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


