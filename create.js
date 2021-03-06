import uuid from "uuid";
import AWS from "aws-sdk";

AWS.config.update({ region: "ap-southeast-2" });
const dynamoDb = new AWS.DynamoDB.DocumentClient();

export function main(event, context, callback) {
 // request body is passed in as a JSON encoded string using 'event.body'   
    const data = JSON.parse(event.body);

    const params = {
        TableName: "notes",
         // 'Item' contains the attributes of the item to be created
         // - 'userId': user identities are federated through the
         // Cognito Identity Pool, we will use the identity id
         // as the user id of the authenticated user
         // - 'noteId': a unique uuid
         // - 'content': parsed from request body
         // - 'attachment': parsed from request body
         // - 'createdAt': current Unix timestamp
         Item: {
             userId: event.requestContext.identity.cognitoIdentityId,
             notesId: uuid.v1(),
             content: data.content,
             attachment: data.attachment,
             createdAt: new Date().getTime()
         }
    };

    dynamoDb.put(params,(error,data) => {
        // Set response headers to enable Cross Origin Resource Sharing
        const headers = {
            "Access-Control-Allow-Origin": "**",
            "Access-Control-Allow-Credentials": true
        };

        // return status code 500 on error
        if (error) {
            const response = {
                statusCode: 500,
                headers: headers,
                body: JSON.stringify({status:false})
            };
            callback(null,response);
            return;
        }
    // return status code 200 and the newly created item
    const response = {
        statusCode: 200,
        headers: headers,
        body: JSON.stringify(params.Item)
    };
    callback(null,response);

    });
}