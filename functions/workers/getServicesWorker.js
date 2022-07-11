const { SFNClient, StartExecutionCommand } = require("@aws-sdk/client-sfn");
const { SSMClient, GetParameterCommand } = require("@aws-sdk/client-ssm");

const getSecrets = async (techStackRef) => {
    console.log('Grabbing state machine ARN from param store that maps to: ', techStackRef);
    try {
        const client = new SSMClient({ region: process.env.AWS_REGION });
        const input = {
            Name: techStackRef,
            WithDecryption: false,
        }
        const command = new GetParameterCommand(input);
        const smArn = await client.send(command);
    } catch (err) {
        console.log('There was an error getting the param');
    }
    return smArn
}

exports.handler = async (event) => {
  console.log(event);
  let result = JSON.parse(event.body);

  // Get secrts params
  let SM_ARN = "";

  // Parse awsResources to invoke. Need to limit on client-side tech stack.

  console.log(`Services included in payload are ${result.data.awsResources}`);
  var services = result.data.awsResources;
  services.forEach((s) => {
    console.log(s);
  });

  if (
    services.includes("ecs") &&
    services.includes("sqs") &&
    services.includes("rds")
  ) {
    console.log(
      "Tech stack ECS with RDS backend. Grabbing ST ARN in order to create NR monitoring..."
    );

    SM_ARN = await getSecrets(services);

    // Invoke SF here
    try {
        const client = new SFNClient({ region: process.env.AWS_REGION });
        const command = new StartExecutionCommand = {
            stateMachineArn: ""
        }
    } catch (err) {
      console.log("There was an error: ", err);
    }
  } else {
    console.log("One or more not provided. Error");
    const err = new Error("Issue creating New Relic monitoring");
    return {
      statusCode: 502,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(err),
      isBase64Encoded: false,
    };
  }

  const response = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(result),
    isBase64Encoded: false,
  };

  return response;
};
