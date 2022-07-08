exports.handler = async (event) => {
  console.log(event);
  let result = JSON.parse(event.body);
  console.log(result.data.apiKey);

  // Parse awsResources to invoke. Need to limit on client-side tech stack.

  console.log(`Services included in payload are ${result.data.awsResources}`);
  var services = result.data.awsResources;
  services.forEach((s) => {
    console.log(s);
  });

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
