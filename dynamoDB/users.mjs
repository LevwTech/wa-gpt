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
  
export const saveUser = async (userNumber, tokensCount, isSubscribed, hasSubscribed) => {
    if (tokensCount < 0) tokensCount = 0;
	const Item = {
	    userNumber: { S: userNumber.toString() },
        tokensCount: { N: tokensCount.toString() },
        isSubscribed: { BOOL: isSubscribed },
        hasSubscribed: { BOOL: hasSubscribed }
	};
	const command = new PutItemCommand({ TableName: usersTableName, Item });
	await dynamodb.send(command);
}
