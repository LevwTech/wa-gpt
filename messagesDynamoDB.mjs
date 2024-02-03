import { DynamoDBClient, PutItemCommand, GetItemCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { MAX_NUMBER_OF_MESSAGES } from './helpers/constants.mjs';
import { promptGPTSummarize } from './openaiAPI.mjs';

const dynamodb = new DynamoDBClient({ region: 'eu-west-1', credentials: {accessKeyId: process.env.AWS_KEY_ID, 
secretAccessKey: process.env.AWS_KEY_SECRET }});

const messagesTableName = "conversations"

export const getMessages = async userNumber => {
	const command = new GetItemCommand({
	  TableName: messagesTableName,
	  Key: {
		userNumber: { S: userNumber.toString() },
	  },
	});
	const data = await dynamodb.send(command);
	if(!data.Item) return [];
	const conversation = unmarshall(data.Item);
	return conversation.messages;
};
  
export const saveMessage = async (userNumber, role, content) => {
	let messages = await getMessages(userNumber);
	const newMessage = { role, content };
	messages.push(newMessage);
	// If the conversation has more than a certain number of messages, we summarize the conversation
	if (role === "assistant" && messages.length > MAX_NUMBER_OF_MESSAGES) {
	  messages = await promptGPTSummarize(messages);
	}
	const Item = {
	  userNumber: { S: userNumber.toString() },
	  messages: {
		L: messages.map(message => ({
			M: {
				role: { S: message.role.toString() },
				content: { S: message.content.toString() }
			}
		}))
	  }
	};
	const command = new PutItemCommand({ TableName: messagesTableName, Item });
	await dynamodb.send(command);
}
