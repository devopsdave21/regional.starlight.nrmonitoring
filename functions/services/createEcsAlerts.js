exports.handler = async (event) => {
    console.log("Checking event object contains ecs...");
  
    const services = event.data.awsResources;
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