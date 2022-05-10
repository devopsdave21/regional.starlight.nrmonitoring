const { Console } = require("console");

exports.handler = async (event) => {
    console.log(event);

    var API_KEY = event.data.apiKey;
    var NR_ACCOUNT_ID = event.data.newRelicAccountId;
    var TEAM_NAME = event.data.teamName;
    var PAGERDUTY_KEY = event.data.pagerdutyApiKey;
    var RESULT = {};

    // Need to validate this at the API level using models and schemas etc.
    // Should not get through to lambda for validation

    if (API_KEY && NR_ACCOUNT_ID && TEAM_NAME && PAGERDUTY_KEY) {
        console.log('All params present and accounted for');
        RESULT = {
            API_KEY,
            NR_ACCOUNT_ID,
            TEAM_NAME,
            PAGERDUTY_KEY
        }
    } else {
        console.log('Missing a param!')
        return {
            statusCode: 500,
            headers: { "Content-Type": "text/plain" },
            body: RESULT
        }
    }

    return {
       statusCode: 200,
       headers: { "Content-Type": "text/plain" },
       body: RESULT 
    }
}