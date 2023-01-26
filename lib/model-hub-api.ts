import * as cdk from 'aws-cdk-lib';
import { CfnOutput } from 'aws-cdk-lib';
import { CfnParametersCode, FunctionUrlAuthType, Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import path = require('path');



interface ModelHubApiStackProps extends cdk.StackProps {
    readonly s3Bucket: Bucket;
}

export class ModelHubApiStack extends cdk.Stack {
  public readonly serviceCode: CfnParametersCode;
  public readonly serviceEndpointOutput: CfnOutput;

  constructor(scope: Construct, id: string, props?: ModelHubApiStackProps) {
    super(scope, id, props);

    const modelHubLambda = new NodejsFunction(this, "ModelHubLambdaHandler", {
        runtime: Runtime.NODEJS_14_X,
        entry: path.join(__dirname, `/../functions/index.ts`),
        // bundling: {
        //     externalModules:[
        //         'aws-sdk'
        //     ],
        // },
        handler: "handler",
        environment: {
          BUCKET_NAME: props!.s3Bucket.bucketName
        },
      });


    props?.s3Bucket.grantReadWrite(modelHubLambda);

    const myFunctionUrl = modelHubLambda.addFunctionUrl({
        authType: FunctionUrlAuthType.NONE,
        cors: {
          allowedOrigins: ['*'],
        }
      });
  
      new CfnOutput(this, 'FunctionUrl', {
        value: myFunctionUrl.url,
      });
  }
}
