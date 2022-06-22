exports.handler = async (event) => {
    console.log("Checking event object contains ecs....");
  
    const services = event.body.body.AWS_SERVICES;
    if (services.includes("ecs")) {
      console.log("Continue creating alert conditions for ECS");
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