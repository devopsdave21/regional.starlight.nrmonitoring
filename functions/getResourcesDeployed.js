const { default: axios } = require("axios");
const gql = require("graphql-tag");
const graphql = require("graphql");
import { NEW_RELIC_URL } from "./constants";

exports.handler = async (event) => {
  console.log(
    "Querying New Relic for resources to get entity guids to use in mutations...",
    JSON.stringify(event)
  );

  try {
    console.log("Querying for resources now...");
    const getResources = await axios({
      url: NEW_RELIC_URL,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "API-KEY": event.body.event.event.RESULT.API_KEY,
      },
      data: {
        query: `mutation {
                _a1: {
                    actor {
                      entitySearch(queryBuilder: {infrastructureIntegrationType: AWS_ECS_CLUSTER}) {
                        count
                        query
                        results {
                          nextCursor
                          entities {
                            accountId
                            entityType
                            guid
                            name
                            type
                            account {
                              id
                            }
                          }
                        }
                      }
                    }
                  }
            }`,
      },
    });
    const response = getResources.data;
    console.log(
      `The response returned from GQL was ${JSON.stringify(response)}`
    );
    return {
      statusCode: 200,
      body: JSON.stringify(response),
      headers: { "Content-Type": "text/plain " },
    };
  } catch (err) {
    console.log("There was an error: ", err);
    return {
      statusCode: 500,
      body: event,
    };
  }
};
