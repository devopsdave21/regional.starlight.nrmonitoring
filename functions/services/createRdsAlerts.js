exports.handler = async (event) => {
    console.log("Checking event object contains rds...");

    const services = event.body.body.AWS_SERVICES;
    if (services.includes("rds")) {
        console.log("Contains rds...moving onto creating the conditions...")
    } else {
        console.log("Does not contain - skipping")
        return {
            statusCode: 500,
        }
    }
}