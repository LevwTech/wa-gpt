import { getBody, getAction, handleBadRequest, handleNotificationReceived, headers, getWhatsAppBotUrl } from "./helpers/utils.mjs";
import { handleMessage, verifyWhatsAppWebhook } from "./messageHandler.mjs";
import { subsriptionNotificationsHandler } from "./payment.mjs";

export const handler = async (event, context, callback) => {
  try {
    const action = getAction(event);
    const body = getBody(event);
    const queryStringParams = event.queryStringParameters;
    return {
      statusCode: 200,
      headers,
      body
    };
    let response;
    switch (action) {
      case "phone":
          response = getWhatsAppBotUrl();
          break;
      case "subscription":
        await subsriptionNotificationsHandler(body);
        return handleNotificationReceived();
      default:  
        await handleMessage(body);
        return handleNotificationReceived();
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


