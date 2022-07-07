exports.handler = async (event) => {
  console.log(
    "Parsing input for services to invoke correct step function",
    event.body.data
  );

  const response = {
    statusCode: 233,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify(event.body.data),
    isBase64Encoded: false,
  };

  return response;
};
