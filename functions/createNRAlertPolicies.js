const axios = require('axios');
const gql = require('graphql-tag');
const graphql = require('graphql');
const { print } = graphql;

exports.handler = async (event) => {
    console.log('In the create alert policies lambda');
    console.log(event);

    const NR_HOST = "https://api.newrelic.com/graphql";

    const createPolicies = `
        mutation: {
            _a1: alertsPolicyCreate(accountId: ${event.body.NR_ACCOUNT_ID}, policy: {incidentPreference: PER_POLICY, name: "${event.body.TEAM_NAME}"}) {
                name
                id
                incidentPreference
            }
        }
    `;

    try {
        const graphqlData = await axios({
            url: NR_HOST,
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "API-KEY": event.body.API_KEY
            },
            data: {
                mutation: print(createPolicies)
            }
        });
        const body = {
            graphqlData: graphqlData.data.data.createPolicies
        }
        return {
            statusCode: 200,
            body: JSON.stringify(body),
            headers: {
                "Access-Control-Allow-Origin": "*"
            }
        }
    } catch (err) {
        console.log('error posting to the API ', err)
    }
}