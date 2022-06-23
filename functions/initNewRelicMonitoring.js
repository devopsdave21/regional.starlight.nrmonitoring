const { Console } = require("console");

exports.handler = async (event) => {
    console.log(event);

    var API_KEY = event.data.data.apiKey;
    var NR_ACCOUNT_ID = event.data.data.newRelicAccountId;
    var TEAM_NAME = event.data.data.teamName;
    var PAGERDUTY_KEY = event.data.data.pagerdutyApiKey;
    var AWS_SERVICES = event.data.data.awsResources
    var RESULT = {}

    // Need to validate this at the API level using models and schemas etc.
    // Should not get through to lambda for validation

    if (API_KEY && NR_ACCOUNT_ID && TEAM_NAME && PAGERDUTY_KEY && AWS_SERVICES) {
        console.log('All params present and accounted for');
        RESULT = {
            API_KEY,
            NR_ACCOUNT_ID,
            TEAM_NAME,
            PAGERDUTY_KEY,
            AWS_SERVICES,
        }
    } else {
        console.log('Missing a param!')
        return {
            statusCode: 500,
            headers: { "Content-Type": "text/plain" },
            RESULT
        }
    }
    return {
       statusCode: 200,
       headers: { "Content-Type": "text/plain" },
       RESULT 
    }
}