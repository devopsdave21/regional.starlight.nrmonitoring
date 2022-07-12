const { SFNClient, StartExecutionCommand } = require("@aws-sdk/client-sfn");
const { SSMClient, GetParameterCommand } = require("@aws-sdk/client-ssm");

const getSecrets = async (techStackRef) => {
  console.log(
    "Grabbing state machine ARN from param store that maps to: ",
    techStackRef
  );
  // Passing in the services array. This function will decide which secret to get
  // based on tech stack param.

  // For now, just test with knowing it will be ECS
  // TODO - Implement this at the API layer as potential params in URL path
  
  if (techStackRef.includes("ecs")) {
    console.log("Contains ECS service...grabbing ARN for step function...");
    let techStackParam = "/monitoring/ecsTechStack";
    try {
      const client = new SSMClient({ region: process.env.AWS_REGION });
      const input = {
        Name: techStackParam,
        WithDecryption: false,
      };
      const command = new GetParameterCommand(input);
      const response = await client.send(command);
      console.log("The response was: ", response);
      console.log('The ARN of step function is: ', response.Parameter.Value)
      return response.Parameter.Value;
    } catch (err) {
      console.log("There was an error getting the param");
    }
  }
  if (techStackRef.includes("ec2")) {
    console.log("Grabbing ec2 tech stack state machine arn for invocation...");
  }
};

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
