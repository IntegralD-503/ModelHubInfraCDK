import { HttpApi } from "@aws-cdk/aws-apigatewayv2-alpha";
import { HttpLambdaIntegration } from "@aws-cdk/aws-apigatewayv2-integrations-alpha";
import * as cdk from "aws-cdk-lib";
import { CfnOutput } from "aws-cdk-lib";
import { AttributeType, BillingMode, Table } from "aws-cdk-lib/aws-dynamodb";
import {
  CfnParametersCode,
  Runtime,
  Function,
  Code
} from "aws-cdk-lib/aws-lambda";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import path = require("path");

interface ModelHubApiStackProps extends cdk.StackProps {
  readonly s3Bucket: Bucket;
  readonly stageName: string;
}

export class ModelHubApiStack extends cdk.Stack {
  public readonly serviceCode: CfnParametersCode;
  public readonly serviceEndpointOutput: CfnOutput;

  constructor(scope: Construct, id: string, props: ModelHubApiStackProps) {
    super(scope, id, props);

    // const modelHubLambda = new NodejsFunction(this, "ModelHubLambdaHandler", {
    //     runtime: Runtime.NODEJS_14_X,
    //     entry: path.join(__dirname, `/../functions/index.ts`),
    //     // bundling: {
    //     //     externalModules:[
    //     //         'aws-sdk'
    //     //     ],
    //     // },
    //     handler: "src/lambda.handler",
    //     environment: {
    //       BUCKET_NAME: props!.s3Bucket.bucketName
    //     },
    //   });

    this.serviceCode = Code.fromCfnParameters()

    // dynamodb doesn't seem to support being passed around stacks so just sticking it in here.
    const modelHubDB = new Table(this, `ModelHubTable${props.stageName}`, { 
      tableName: `ModelHubDB${props.stageName}`,
      partitionKey: { name: 'id', type: AttributeType.STRING }, 
      billingMode: BillingMode.PAY_PER_REQUEST, 
    });

    const modelHubLambda = new Function(this, `ModelHubAPILambda${props.stageName}`, {
      runtime: Runtime.NODEJS_14_X,
      handler: "src/lambda.handler",
      code: this.serviceCode,
      functionName: `ModelHubAPILambda${props.stageName}`,
      description: `Generated on ${new Date().toISOString()}`,
      environment: {
        BUCKET_NAME: props.s3Bucket.bucketName,
        DYNAMODB_TABLE: modelHubDB.tableName
      }
    });

    const httpApi = new HttpApi(this, `ModelHubApi${props.stageName}`, {
      defaultIntegration: new HttpLambdaIntegration("LambdaIntegration", modelHubLambda),
      apiName: `ModelHubAPI${props.stageName}`
  })

    props.s3Bucket.grantReadWrite(modelHubLambda);
    modelHubDB.grantReadWriteData(modelHubLambda);

    // const myFunctionUrl = modelHubLambda.addFunctionUrl({
    //   authType: FunctionUrlAuthType.NONE,
    //   cors: {
    //     allowedOrigins: ["*"],
    //   },
    // });

    // new CfnOutput(this, "FunctionUrl", {
    //   value: myFunctionUrl.url,
    // });
  }
}
