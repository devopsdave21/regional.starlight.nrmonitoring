exports.handler = async (event) => {
  console.log(
    "Parsing input for services to invoke correct step function",
    JSON.parse(event.body)
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
