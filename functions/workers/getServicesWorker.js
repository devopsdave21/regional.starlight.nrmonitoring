const { SFNClient, StartExecutionCommand } = require("@aws-sdk/client-sfn");
const { SSMClient, GetParameterCommand } = require("@aws-sdk/client-ssm");
const { getParameters } = require("../../helpers/getParams");

exports.handler = async (event) => {
  console.log(event);
  let result = JSON.parse(event.body);

  // Get secrts params
  let SM_ARN = "";

  // Parse awsResources to invoke. Need to limit on client-side tech stack.

  console.log(`Services included in payload are ${result.data.awsResources}`);
  var services = result.data.awsResources;

  SM_ARN = await getSecrets(services);
  console.log(SM_ARN);

  // Invoke SF here
  try {
    const client = new SFNClient({ region: process.env.AWS_REGION });
    const input = {
      stateMachineArn: SM_ARN,
      input: event.body,
    };
    const command = new StartExecutionCommand(input);
    const response = await client.send(command);
    console.log(response);
  } catch (err) {
    console.log("There was an error: ", err);
  }

  const response = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
    },
    body: JSON.parse(event.body),
    isBase64Encoded: false,
  };

  return response;
};
