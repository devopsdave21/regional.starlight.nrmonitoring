const { default: axios } = require("axios");
const gql = require("graphql-tag");
const graphql = require("graphql");
import { NEW_RELIC_URL } from "./constants";

/*
TODO 
    1.Add query for ECS service
    2.Add query for SQS services
    3.Add query for RDS services

*/

var CLUSTER_GUID = "";

const queryForResourcesEcs = async (obj) => {
  console.log(
    `Querying NR account for ECS Cluster resources deployed for account ID ${obj.accountId}`
  );
  // ECS Clusters resources deployed in NR
  // TODO - Need to put some logic in here to cater for multiple cluster under same account ID
  try {
    console.log("Querying for resources now...");
    const getResources = await axios({
      url: NEW_RELIC_URL,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "API-KEY": obj.NrAPIKey,
      },
      data: {
        query: `query {
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
            }`,
      },
    });
    const response = getResources.data.data.actor.entitySearch.results.entities;
    console.log(
      `The response returned from GQL was ${JSON.stringify(response)}}`
    );
    response.forEach((r) => {
      if (r.accountId === obj.accountId) {
        console.log("Found the account ID. Grabbing Cluster...");

        // Check if multiple clusters - still to do
        CLUSTER_GUID = r.guid;
        console.log(CLUSTER_GUID);
      }
    });
    return {
      statusCode: 200,
      CLUSTER_GUID,
      ACCOUNT_ID: obj.accountId,
      POLICY_ID: obj.policyId,
      headers: { "Content-Type": "text/plain " },
    };
  } catch (err) {
    console.log("There was an error: ", err);
    return {
      statusCode: 500,
      body: response,
    };
  }
};

const queryForResourcesSqs = async (obj) => {
  console.log("Querying NR account for any SQS queues...");
};

const queryForResourcesRds = async (obj) => {
  console.log("Querying NR account for RDS databases/clusters....");
};

exports.handler = async (event) => {
  console.log(event);
  console.log(
    "Querying New Relic for resources to get entity guids to use in mutations...",
    JSON.stringify(event.event.event.event.RESULT.NR_ACCOUNT_ID)
  );
  const resultEcs = await queryForResourcesEcs({
    accountId: event.event.event.event.RESULT.NR_ACCOUNT_ID,
    NrAPIKey: event.event.event.event.RESULT.API_KEY,
    policyId: event.policyId,
  });
  console.log('TEST TEST:', resultEcs);
  return {
    resultEcs,
  };
  const sqsResult = await queryForResourcesSqs();
  const rdsResult = await queryForResourcesRds();
};
