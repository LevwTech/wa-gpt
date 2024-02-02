import uuid4 from "uuid4";
import { getBody, getAction, handleBadRequest, headers} from "./helpers/utils.mjs";
import { receiveMessage } from "./messageHandler.mjs";

export const handler = async (event, context, callback) => {
  let body;
  try {
    body = getBody(event);
    const action = getAction(event);
    if (!action) return handleBadRequest();
    let response;
    switch (action) {
      case "phone":
          response = getWhatsAppInfo();
          break;
      case "message":
          if (event.httpMethod === "GET")
            response = verifyWhatsAppWebhook(body);
          else
            await receiveMessage(body);
            return;
      default:  
        return handleBadRequest();

    }
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response)
    };
  } catch (error) {
    const errorResponse = {
      status: "error",
      message: "Internal Server Error",
    };
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(errorResponse),
    };
  }
};


