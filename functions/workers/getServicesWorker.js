exports.handler = async (event) => {
  var data = event.body.data;
  console.log(event.resource);
  //console.log(event.body.data.apiKey);
  console.log(
    "Parsing input for services to invoke correct step function",
    data
  );

  const variable = event.body.data;

if (
  typeof variable === 'object' &&
  variable !== null &&
  !Array.isArray(variable)
) {
  console.log('✅ Value is an object');
} else {
  console.log('⛔️ Value is not an object');
}

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
