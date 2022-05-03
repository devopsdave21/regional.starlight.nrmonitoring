import { Stack, StackProps, Duration } from "aws-cdk-lib";
import { Construct, Node } from "constructs";
import { Architecture, Code, Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import * as apig from "aws-cdk-lib/aws-apigateway";
import * as iam from "aws-cdk-lib/aws-iam";
import * as sfn from "aws-cdk-lib/aws-stepfunctions";
import * as tasks from "aws-cdk-lib/aws-stepfunctions-tasks";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class RegionalStarlightNrmonitoringStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Create lambdas
    const testFunc = new NodejsFunction(this, "test test", {
      functionName: "test",
      entry: "functions/test.js",
      runtime: Runtime.NODEJS_14_X,
      logRetention: RetentionDays.ONE_WEEK,
      memorySize: 1024,
    });

    // Create the workflow
    const getTest = new tasks.LambdaInvoke(this, "Test", {
      lambdaFunction: testFunc,
      outputPath: "$.Payload",
    });

    const wait = new sfn.Wait(this, "Wait", {
      time: sfn.WaitTime.duration(Duration.seconds(3)),
    });

    const definition = getTest.next(wait);

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
            resources: [`${sfnArn}`],
          }),
        ],
      })
    );

    apigateway.root.addMethod(
      "POST",
      new apig.AwsIntegration({
        service: "states",
        action: "StartExecution",
        integrationHttpMethod: "POST",
        path: '/execution',
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
            "application/json": `{
              "stateMachineArn": ${sfnArn}
            }`,
          },
        },
      }),
      {
        methodResponses: [{ statusCode: "200" }],
      }
    );
  }
}
