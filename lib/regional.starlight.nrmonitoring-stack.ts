import { Stack, StackProps, Duration } from "aws-cdk-lib";
import { Construct, Node } from "constructs";
import { Architecture, Code, Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import * as apig from "aws-cdk-lib/aws-apigateway";
import * as iam from "aws-cdk-lib/aws-iam";
import * as sfn from "aws-cdk-lib/aws-stepfunctions";
import * as tasks from "aws-cdk-lib/aws-stepfunctions-tasks";
import { JsonSchemaType } from "aws-cdk-lib/aws-apigateway";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class RegionalStarlightNrmonitoringStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Create lambdas
    const initNewRelicMonitoring = new NodejsFunction(
      this,
      "Automated New Relic Monitoring",
      {
        functionName: "initAutomatedNewRelicMonitoring",
        entry: "functions/initNewRelicMonitoring.js",
        runtime: Runtime.NODEJS_14_X,
        logRetention: RetentionDays.ONE_WEEK,
        memorySize: 1024,
      }
    );

    const createAlertPolicies = new NodejsFunction(
      this,
      "Create NR Alert Policies",
      {
        functionName: "createNewRelicAlertPolicies",
        entry: "functions/createNRAlertPolicies.js",
        runtime: Runtime.NODEJS_14_X,
        logRetention: RetentionDays.ONE_WEEK,
        memorySize: 1024,
      }
    );

    const createEcsAlerts = new NodejsFunction(
      this,
      "Create ECS conditions",
      {
        functionName: "createEcsAlerts",
        entry: "functions/services/createEcsAlerts.js",
        runtime: Runtime.NODEJS_14_X,
        logRetention: RetentionDays.ONE_WEEK,
        memorySize: 1024,
      }
    );

    const createSqsAlerts = new NodejsFunction(
      this,
      "Create SQS conditions",
      {
        functionName: "createSqsAlerts",
        entry: "functions/services/createSqsAlerts.js",
        runtime: Runtime.NODEJS_14_X,
        logRetention: RetentionDays.ONE_WEEK,
        memorySize: 1024,
      }
    );

    const createAlertConditions = new NodejsFunction(
      this,
      "Create alert conditions",
      {
        functionName: "createConditions",
        entry: "functions/createConditions.js",
        runtime: Runtime.NODEJS_14_X,
        logRetention: RetentionDays.ONE_WEEK,
        memorySize: 1024,
      }
    );

    // Create the workflow
    const initNewRelicMonitoringTask = new tasks.LambdaInvoke(
      this,
      "initNRParamChecker",
      {
        lambdaFunction: initNewRelicMonitoring,
        outputPath: "$.Payload",
      }
    );

    const alertPoliciesTask = new tasks.LambdaInvoke(
      this,
      "createAlertPolicies",
      {
        lambdaFunction: createAlertPolicies,
        outputPath: "$.Payload",
      }
    );

    const createAlertConditionsTask = new tasks.LambdaInvoke(
      this,
      "createEcsAlerts",
      {
        lambdaFunction: createAlertPolicies,
        outputPath: "$.Payload",
      }
    );

    const createEcsAlertConditionsTask = new tasks.LambdaInvoke(
      this,
      "createEcsConditions",
      {
        lambdaFunction: createEcsAlerts,
        outputPath: "$.Payload",
      }
    );

    const createSqsAlertConditionsTask = new tasks.LambdaInvoke(
      this,
      "createSqsConditions",
      {
        lambdaFunction: createSqsAlerts,
        outputPath: "$.Payload",
      }
    );

    const definition = initNewRelicMonitoringTask
      .next(alertPoliciesTask)
      .next(createAlertConditionsTask);

    const stateMachine = new sfn.StateMachine(
      this,
      "Automated-monitoring-New-Relic",
      {
        definition,
        timeout: Duration.minutes(3),
      }
    );

    const sfnArn = stateMachine.stateMachineArn;

    // Create the API
    const apigateway = new apig.RestApi(this, "endpoint");

    const credentialsRole = new iam.Role(this, "getRole", {
      assumedBy: new iam.ServicePrincipal("apigateway.amazonaws.com"),
    });

    credentialsRole.attachInlinePolicy(
      new iam.Policy(this, "getPolicy", {
        statements: [
          new iam.PolicyStatement({
            actions: ["states:StartExecution"],
            effect: iam.Effect.ALLOW,
            resources: [
              "arn:aws:states:eu-west-1:189221230217:stateMachine:AutomatedmonitoringNewRelic5C4D2407-Zr4Xj7odBnly",
            ],
          }),
        ],
      })
    );

    // Need to attach this to API somehow. TO-DO
    const requestModel = apigateway.addModel("Validator-model", {
      contentType: "application/json",
      modelName: "ValidatorModel",
      schema: {
        schema: apig.JsonSchemaVersion.DRAFT4,
        title: "validator",
        type: apig.JsonSchemaType.OBJECT,
        properties: {
          apiKey: {
            type: JsonSchemaType.STRING,
            minLength: 1,
            maxLength: 30,
          },
          newRelicAccountId: {
            type: JsonSchemaType.STRING,
            minLength: 1,
            maxLength: 8,
          },
          teamName: {
            type: JsonSchemaType.STRING,
            minLength: 1,
            maxLength: 100,
          },
          pagerdutyApiKey: {
            type: JsonSchemaType.STRING,
            minLength: 1,
            maxLength: 100,
          },
        },
      },
    });

    const api = apigateway.root.addMethod(
      "POST",
      new apig.AwsIntegration({
        service: "states",
        action: "StartExecution",
        integrationHttpMethod: "POST",
        options: {
          credentialsRole,
          integrationResponses: [
            {
              statusCode: "200",
              responseTemplates: {
                "application/json": `{"complete": true}`,
              },
            },
          ],
          requestTemplates: {
            "application/json": `
            #set($body= $input.json('$'))
            #set($inputRoot='{ "data" :'+$body+',"apiInfo":{"httpMethod" :"'+ $context.httpMethod+'", "apiKey":"'+ $context.identity.apiKey+'"}}')
            #set($apiData=$util.escapeJavaScript($inputRoot))
            #set($apiData=$apiData.replaceAll("\\'","'"))
            {
              "input" :"$apiData",
              "stateMachineArn": "arn:aws:states:eu-west-1:189221230217:stateMachine:AutomatedmonitoringNewRelic5C4D2407-Zr4Xj7odBnly"  
            }`,
            // {
            //   "stateMachineArn": "arn:aws:states:eu-west-1:189221230217:stateMachine:AutomatedmonitoringNewRelic5C4D2407-Zr4Xj7odBnly"
            // }`,
          },
        },
      }),
      {
        methodResponses: [{ statusCode: "200" }],
      }
    );
  }
}
