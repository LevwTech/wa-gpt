import { DynamoDBClient, PutItemCommand, ScanCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import uuid4 from 'uuid4';
import { getTTL } from "./helpers/utils.mjs";
const dynamodb = new DynamoDBClient({ region: 'eu-west-1' });
const messagesTableName = "messages"

export const getMessages = async userNumber => {
    const params = {
		TableName: messagesTableName,
		FilterExpression: 'userNumber = :userNumber',
		ExpressionAttributeValues: {
			':userNumber': { S: userNumber.toString() }
		}
	};

	const command = new ScanCommand(params);
	const data = await dynamodb.send(command);
	const messages = data.Items.map(item => {
		return { role: unmarshall(item).role, content: unmarshall(item).content};
	});
	return messages;
};

export const saveMessage = async (userNumber, role, content) => {
	const Item = {
		id: { S: uuid4().toString() },
		userNumber: { S: userNumber.toString() },
		role: { S: role.toString() },
		content: { S: content.toString() },
        ttl: { N: getTTL().toString() }
	};
	const command = new PutItemCommand({ TableName: messagesTableName, Item });
	await dynamodb.send(command);
};
