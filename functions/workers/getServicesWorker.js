exports.handler = async (event) => {
//var resources = event.data.awsResources;
console.log(event);
let result = JSON.parse(event.body);
console.log(result.data.apiKey);

  const response = {
    statusCode: 233,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(result),
    isBase64Encoded: false,
  };

  return response;
};
