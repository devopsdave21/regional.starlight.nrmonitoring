exports.handler = async (event) => {
    console.log("Checking event object contains ecs....");
  
    const services = event.body.body.AWS_SERVICES;
    console.log(event);
    console.log("The services included in the call are: ", services);
    if (services.includes("ecs")) {
      console.log("Continue creating alert conditions for ECS");
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