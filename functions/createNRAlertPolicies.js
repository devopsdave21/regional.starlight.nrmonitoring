const axios = require("axios");
const gql = require("graphql-tag");
const graphql = require("graphql");
const {
  EventBridgeDestination,
} = require("aws-cdk-lib/aws-lambda-destinations");

const NR_HOST = "https://api.newrelic.com/graphql";
var NR_API_KEY = "";
var HAS_ALERT_POLICY = false;
var POLICY_ID = "";

const getAlertPolicies = async (e) => {
  console.log(
    "Seeing if any alert policies have been created with same name..."
  );
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
                    id
                  }
                }
              }
            }
          }
        }`,
      },
    });
    const response =
      data.data.data.actor.account.alerts.policiesSearch.policies;
    console.log(`The data returned from search is ${JSON.stringify(response)}`);
    response.forEach((r) => {
      console.log(`The name of the policie(s) are ${r.name}`)
      console.log(e.event.event.RESULT.TEAM_NAME)
      if (r.name === e.event.event.RESULT.TEAM_NAME) {
        console.log(
          "Already found 1 or more alert policies with same name. Not creating a new one"
        );
        HAS_ALERT_POLICY = true;
        POLICY_ID = r.id;
      }
    });
    // Need to only return the name of the policy that matches the name of the policy being created at client
  } catch (err) {
    console.log(
      `There has been an error getting currently created alert policies: ${err}`
    );
  }
};

exports.handler = async (event) => {
  NR_API_KEY = event.event.event.RESULT.API_KEY;
  console.log("In the create alert policies lambda");
  console.log(event);
  console.log("Seeing if alert policy has already been created...");
  const result = await getAlertPolicies(event);

  /*
  TODO - Need to put some logic in here to check if an alert policy has already been created
  with this name
  */
  if (HAS_ALERT_POLICY === false) {
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
        policyId: body.graphqlData.data._a1.id,
      };
    } catch (err) {
      console.log("error posting to New Relic API ", err);
    }
  } else {
    console.log("Alert policy already in place. Not creating a new one");
    // Need to get the alert policy ID to always send to next function to create the alerts
    console.log(`The already created alert policy is ${POLICY_ID}`);
  }
  return {
    statusCode: 200,
    event,
    policyId: POLICY_ID,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  };
};
