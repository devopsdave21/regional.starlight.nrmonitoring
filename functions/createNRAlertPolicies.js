const axios = require("axios");
const gql = require("graphql-tag");
const graphql = require("graphql");
const { EventBridgeDestination } = require("aws-cdk-lib/aws-lambda-destinations");

const NR_HOST = "https://api.newrelic.com/graphql";
var NR_API_KEY = '';

const getAlertPolicies = async (e) => {
  console.log('Seeing if any alert policies have been created with same name...');
  try {
    const data = await axios({
      url: NR_HOST,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "API-KEY": NR_API_KEY,
      },
      data: {
        query: `query {
          actor {
            account(id: ${e.event.event.RESULT.NR_ACCOUNT_ID}) {
              alerts {
                policiesSearch {
                  policies {
                    name
                  }
                }
              }
            }
          }
        }`
      },
    });
    const response = data.data;
    console.log(`The data returned from search is ${response}`);
    // Need to only return the name of the policy that matches the name of the policy being created at client
    return response;
  } catch (err) {
    console.log(`There has been an error getting currently created alert policies: ${err}`);
  }
}

exports.handler = async (event) => {
  console.log("In the create alert policies lambda");
  console.log(event);
  console.log('Seeing if alert policy has already veeb created...')
  getAlertPolicies(event);

  /*
  TODO - Need to put some logic in here to check if an alert policy has already been created
  with this name
  */

  NR_API_KEY = event.event.event.RESULT.API_KEY

  try {
    const graphqlData = await axios({
      url: NR_HOST,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "API-KEY": NR_API_KEY,
      },
      data: {
        query: `mutation {
            _a1: alertsPolicyCreate(accountId: ${event.event.event.RESULT.NR_ACCOUNT_ID}, policy: {incidentPreference: PER_POLICY, name: "${event.event.event.RESULT.TEAM_NAME}"}) {
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
    return {
      statusCode: 200,
      body,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    };
  } catch (err) {
    console.log("error posting to New Relic API ", err);
  }

  
};
