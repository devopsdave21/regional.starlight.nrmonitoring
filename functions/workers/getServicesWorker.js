exports.handler = async (event) => {
  var data = event.body.data;
  console.log(event.resource);
  console.log(event.body.data.apiKey);
  console.log(
    "Parsing input for services to invoke correct step function",
    data
  );

  const response = {
    statusCode: 233,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify(event.body),
    isBase64Encoded: false,
  };

  return response;
};
