# Automated alerting in New Relic

This utility creates alert policy and corresponding conditions in New Relic using
the NerdGraph API.

The utility requires the following payload as input:

{
	  "data": {
	    "apiKey": "NRAK-******************",
	    "newRelicAccountId": 1234567,
	    "teamName": "CloudOps-Regional-UKI-ES",
	    "pagerdutyApiKey": "**************************",
	    "awsResources": [
	      "ecs",
	      "sqs",
	      "rds"
	    ]
	  }
}

