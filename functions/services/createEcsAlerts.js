const { default: axios } = require("axios");
const gql = require("graphql-tag");
const graphql = require("graphql");
import { NEW_RELIC_URL } from "../constants"

exports.handler = async (event) => {
  console.log("Checking event object contains ecs....");

  const services = event.body.body.AWS_SERVICES;
  console.log(event)
  if (services.includes("ecs")) {
    console.log("Continue creating alert conditions for ECS");

    const ecsConditions = await axios({
        url: NEW_RELIC_URL,
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            // Store API_KEY in param store - to-do
            "API-KEY": event.body.body.API_KEY
        },
        data: {
            query: `mutation {
                firstQuery: alertsNrqlConditionStaticCreate(accountId: ${event.body.body.NR_ACCOUNT_ID}, policyId: ${policyId}, condition: {
                    name: "mongodb-CPU-High"
                    enabled: true
                    nrql: {
                        query: "SELECT average('cpuPercent') FROM SystemSample WHERE entityGuid = ${guid}"
                    }
                    signal: {
                        aggregationWindow: 60
                        evaluationOffset: 3
                    }
                    terms: {
                        threshold: 80,
                        thresholdOccurrences: AT_LEAST_ONCE
                        thresholdDuration: 180
                        operator: ABOVE
                        priority: CRITICAL
                    }
                    valueFunction: SINGLE_VALUE
                    violationTimeLimitSeconds: 86400
                }) {
                    id
                    name
                }
                secondQuery: alertsNrqlConditionStaticCreate(accountId: ${event.body.body.NR_ACCOUNT_ID}, policyId: ${policyId}, condition: {
              name: "mongodb-Connections-High"
              enabled: true
              nrql: {
                  query: "SELECT latest('mongo.mongod.connections.current') AS Connections FROM Metric WHERE mongo.replsetState ='PRIMARY'"
              }
              signal: {
                  aggregationWindow: 60
                  evaluationOffset: 3
              }
              terms: {
                  threshold: 500,
                  thresholdOccurrences: AT_LEAST_ONCE
                  thresholdDuration: 180
                  operator: ABOVE
                  priority: CRITICAL
              }
              valueFunction: SINGLE_VALUE
              violationTimeLimitSeconds: 86400
          }) {
              id
              name
          }
        }`
        }
    })

  } else {
    return {
      statusCode: 500,
    };
  }

  return {
    statusCode: 200,
    body: services,
    headers: { "Content-Type": "text/plain" },
  };
};
