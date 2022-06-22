const axios = require('axios');
const gql = require("graphql-tag");
const graphql = require("graphql");

exports.handler = async (event) => {
  console.log("Scanning AWS account for resources");
  console.log(event);

  const NR_HOST = "https://api.newrelic.com/graphql";

  try {
    const graphqlData = await axios({
      url: NR_HOST,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "API-KEY": event.body.API_KEY,
      },
      data: {
        query: `query {
          actor {
            entitySearch(query: "accountId = '${event.body.NR_ACCOUNT_ID}' AND type IN ('HOST')") {
              results {
                entities {
                  guid
                  name
                  tags {
                    key
                    values
                  }
                }
              }
            }
          }
        }`
      }
    })
    console.log(graphqlData);
  } catch (err) {
    console.log("error posting to the API: ", err);
  }

};
