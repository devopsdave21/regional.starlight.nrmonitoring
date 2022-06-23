import { ECSClient, ListClustersCommand } from "@aws-sdk/client-ecs";

exports.handler = async (event) => {
  console.log("Querying the AWS account where the resources live...", event);

  // Need a way to dynamically set up IAM role to query target account...

  var accessParams = {
    accessKeyId: event.accessParams.accessKeyId,
    secretAccessKey: event.accessParams.secretAccessKey,
    sessionToken: event.accessParams.sessionToken,
  };

  console.log(`Access params are ${accessParams}`);

  try {
    const client = new ECSClient({
      region: process.env.AWS_REGION,
      credentials: accessParams,
    });
  } catch (err) {
    console.log(err);
  }
};
