import uuid4 from "uuid4";
import { getBody, getAction, handleBadRequest, headers} from "./helpers/utils.mjs";

export const handler = async (event, context, callback) => {
  let body;
  try {
    body = getBody(event);
    const action = getAction(event);
    if (!body || !action) return handleBadRequest();
    const response = {
      uuid: uuid4(),
      status: "success",
      message: "Hello World!"
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


