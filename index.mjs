import { getBody, getAction, handleNotificationReceived, headers, getWhatsAppBotUrl } from "./helpers/utils.mjs";
import { handleMessage } from "./messageHandler.mjs";
import { subsriptionNotificationsHandler } from "./payment.mjs";

export const handler = async (event, context, callback) => {
  try {
    const action = getAction(event);
    const body = getBody(event);
    let response;
    switch (action) {
      case "phone":
          const lang = event.queryStringParameters?.lang || "en";
          response = getWhatsAppBotUrl(lang);
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


