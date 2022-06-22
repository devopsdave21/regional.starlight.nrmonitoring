exports.handler = async (event) => {
  console.log("Checking event object contains sqs....");

  const services = event.body.AWS_SERVICES;
  console.log(event);
  console.log("The services included in the call are: ", services);
  if (services.includes("sqs")) {
    console.log("Continue creating alert conditions for SQS");
  } else {
    return {
      statusCode: 500,
      body: services,
    };
  }

  return {
    statusCode: 200,
    body: services,
    headers: { "Content-Type": "text/plain" },
  };
};
