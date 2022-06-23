const axios = require("axios");
const gql = require("graphql-tag");
const graphql = require("graphql");

exports.handler = async (event) => {
  console.log("In the create alert policies lambda");
  console.log(event);

  const NR_HOST = "https://api.newrelic.com/graphql";

  /*
  Need to put some logic in here to check if an alert policy has already been created
  with this name
  */

  try {
    const graphqlData = await axios({
      url: NR_HOST,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "API-KEY": event.RESULT.API_KEY,
      },
      data: {
        query: `mutation {
            _a1: alertsPolicyCreate(accountId: ${event.RESULT.NR_ACCOUNT_ID}, policy: {incidentPreference: PER_POLICY, name: "${event.RESULT.TEAM_NAME}"}) {
              name
              id
              incidentPreference
            }
          }`,
      },
    });
    const body = {
      event,
      graphqlData: graphqlData.data,
    };
    console.log("The body of the mutation is: ", JSON.stringify(body));
    // Need to send policy ID back to next SF task - todo
    return {
      statusCode: 200,
      body: body,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    };
  } catch (err) {
    console.log("error posting to the API ", err);
  }

  
};
