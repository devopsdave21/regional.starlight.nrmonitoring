const { Console } = require("console");

exports.handler = async (event) => {
    console.log(event);

    var API_KEY = event.apiKey;
    var NR_ACCOUNT_ID = event.newRelicAccountId;
    var TEAM_NAME = event.teamName;
    var PAGERDUTY_KEY = event.pagerdutyApiKey;
    var RESULT = {};

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
}