const { default: axios } = require("axios");
const gql = require("graphql-tag");
const graphql = require("graphql");
import { NEW_RELIC_URL } from "../constants"

exports.handler = async (event) => {
  console.log("Checking event object contains ecs....");

  const services = event.body.body.AWS_SERVICES;
  if (services.includes("ecs")) {
    console.log("Continue creating alert conditions for ECS");

    const ecsConditions = await axios({
        url: NEW_RELIC_URL,
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            // Store API_KEY in param store - to-do
            "API-KEY": event.body.body.API_KEY
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
