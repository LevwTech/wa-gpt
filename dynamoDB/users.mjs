import { DynamoDBClient, PutItemCommand, GetItemCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';

const dynamodb = new DynamoDBClient({ region: 'eu-west-1', credentials: {accessKeyId: process.env.AWS_KEY_ID, 
secretAccessKey: process.env.AWS_KEY_SECRET }});

const usersTableName = "users";

export const getUser = async userNumber => {
	const command = new GetItemCommand({
	  TableName: usersTableName,
	  Key: {
		userNumber: { S: userNumber.toString() },
	  },
	});
	const data = await dynamodb.send(command);
	if(!data.Item) return null;
	const user = unmarshall(data.Item);
	return user;
};
  
export const saveUser = async (userNumber, usedTokens, quota, isSubscribed, hasSubscribed, nextRenewalUnixTime, subscriptionId) => {
	const Item = {
	    userNumber: { S: userNumber.toString() },
        usedTokens: { N: usedTokens.toString() },
		quota: { N: quota.toString() },
        isSubscribed: { BOOL: isSubscribed },
        hasSubscribed: { BOOL: hasSubscribed },
		nextRenewalUnixTime: { N: nextRenewalUnixTime.toString() },
		subscriptionId: { S: subscriptionId.toString() }
	};
	const command = new PutItemCommand({ TableName: usersTableName, Item });
	await dynamodb.send(command);
}

export const getUserUsingSubscriptionId = async subscriptionId => {
	// TODO: Implement this function
	const command = new GetItemCommand({
	  TableName: usersTableName,
	  IndexName: "subscriptionId-index",
	  Key: {
		subscriptionId: { S: subscriptionId.toString() },
	  },
	});
	const data = await dynamodb.send(command);
	if(!data.Item) return null;
	const user = unmarshall(data.Item);
	return user;
};
