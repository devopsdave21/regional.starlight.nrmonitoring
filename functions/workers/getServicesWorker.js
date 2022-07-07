exports.handler = async (event) => {
var resources = event.data.awsResources;

console.log(resources);

  const response = {
    statusCode: 233,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify(awsResources),
    isBase64Encoded: false,
  };

  return response;
};
