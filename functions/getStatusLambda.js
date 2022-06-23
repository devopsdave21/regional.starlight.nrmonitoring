exports.handler = async (event) => {
    console.log(event.status);
    if (event.status === "SUCCEEDED") {
      console.log("Successful in getting STS: ", event);
      // This is passed onto anything that is in the chain - need to pass in the credentials
      return {
        status: "SUCCEEDED",
        id: event["id"],
        accessKeyId: event.accessKeyId,
        secretAccessKey: event.secretAccessKey,
        sessionToken: event.sessionToken,
      };
    } else {
      console.log("Not successful in getting STS: ", event);
      return { status: "FAILED", id: event["id"] };
    }
  };
  