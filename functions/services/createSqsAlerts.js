const { default: axios } = require("axios");
const gql = require("graphql-tag");
const graphql = require("graphql");
import { NEW_RELIC_URL } from "../constants";

exports.handler = async (event) => {
  console.log("Checking event object contains sqs....");

  console.log(JSON.stringify(event));
  const services = event.body.event.RESULT.AWS_SERVICES;
  if (services.includes("sqs")) {
    console.log("Continue creating alert conditions for SQS");
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
