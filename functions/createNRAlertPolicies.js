const axios = require("axios");
const gql = require("graphql-tag");
const graphql = require("graphql");
import { NEW_RELIC_URL } from "../functions/constants"


exports.handler = async (event) => {
  console.log("In the create alert policies lambda");
  console.log(event);

  try {
    const graphqlData = await axios({
      url: "https://api.newrelic.com/graphql",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "API-KEY": event.body.API_KEY,
      },
      data: {
        query: `mutation {
            _a1: alertsPolicyCreate(accountId: ${event.body.NR_ACCOUNT_ID}, policy: {incidentPreference: PER_POLICY, name: "${event.body.TEAM_NAME}"}) {
              name
              id
              incidentPreference
            }
          }`,
      },
    });
    const body = {
      graphqlData: graphqlData.data._a1,
    };
    console.log("The body of the mutation is: ", JSON.stringify(body));
    // need to pass policy id in too
    return {
      statusCode: 200,
      body: event,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    };
  } catch (err) {
    console.log("error posting to the API ", err);
  }

  
};
