const { SSMClient, getParameterCommand } = require("aws-sdk/client-ssm");

async function getParameters(p) {
  console.log("Getting required parameters now...");
  console.log(p);

  // First part to identify services by checking if param is an array, else move onto
  // individual param
  
  if (p.isArray()) {
      if (p.includes("ecs")) {
          console.log("Contains ECS service...grabbing ARN now for step function");
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
  } else {
    
  }
}

module.exports.getParameters = getParameters;
