const { STSClient, AssumeRoleCommand } = require("@aws-sdk/client-sts");
import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";
/**
 * 
 * @returns Retuns an STS token to allow us to query in the target account
 * 
 *  Note - need to statically put the role arn we create in target account and place in here.
 *  This cannot be dynamic yet
 * 
 * {
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "AWS": "arn:aws:sts::ACCOUNT-ID:assumed-role/CostSavingsPocStack-getStsAuthServiceRole9C31EFBF-18CSVVQ86X9EU/get-sts"
            },
            "Action": "sts:AssumeRole",
            "Condition": {}
        }
    ]
}
 */
const assumeRole = async (accountId) => {
  const client = new STSClient({ region: process.env.AWS_REGION });
  const assumeRoleRequest = new AssumeRoleCommand({
    RoleArn: `arn:aws:iam::${accountId}:role/role_to_assume_cdk`,
    RoleSessionName: "temp-role-automation",
  });

  const response = await client.send(assumeRoleRequest);
  console.log(`The response is ${JSON.stringify(response)}`);

  return {
    status: "SUCCEEDED",
    accessKeyId: String(response.Credentials.AccessKeyId),
    secretAccessKey: String(response.Credentials.SecretAccessKey),
    sessionToken: response.Credentials.SessionToken,
  };
};
exports.handler = async (event) => {
  console.log(event.field);
  var accessParams;
  try {
    const client = new SSMClient({
      region: process.env.AWS_REGION
    });
    const input = {
      Name: 'tuefideliza-account-id',
      WithDecryption: false
    }
    const command = new GetParameterCommand(input);
    const response = await client.send(command);
    console.log(response.Parameter.Value);
    var accountId = response.Parameter.Value
    accessParams = await assumeRole(accountId);
    return {
      accessParams,
      event
    };
  } catch (err) {
    console.error(`There was an error calling STS ${err}`);
  }
};