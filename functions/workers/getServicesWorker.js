exports.handler = async (event) => {
//var resources = event.data.awsResources;
console.log(event);

console.log(resources);

  const response = {
    statusCode: 233,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(event.body.apiKey),
    isBase64Encoded: false,
  };

  return response;
};
