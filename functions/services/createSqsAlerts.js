exports.handler = async (event) => {
  console.log("Checking event object contains sqs....");

  const services = event.body.body.AWS_SERVICES;
  if (services.includes("sqs")) {
    console.log("Continue creating alert conditions for SQS");
  } else {
    return {
      statusCode: 500,
    };
  }

  return {
    statusCode: 200,
    body: services,
    headers: { "Content-Type": "text/plain" },
  };
};
