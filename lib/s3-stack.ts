import * as cdk from 'aws-cdk-lib';
import { AccountRootPrincipal } from 'aws-cdk-lib/aws-iam';
import { Key } from 'aws-cdk-lib/aws-kms';
import { BlockPublicAccess, Bucket, ObjectOwnership } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

// interface S3StackProps extends cdk.StackProps {
//   readonly lambdaFunction: NodejsFunction;
// }

export class S3Stack extends cdk.Stack {
  public readonly modelHubBucket: Bucket;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const s3Bucket = new Bucket(this, 'ModelHubBucket', {
      objectOwnership: ObjectOwnership.BUCKET_OWNER_ENFORCED,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      encryptionKey: new Key(this, 's3BucketModelHubKMSKey'),
    });

    s3Bucket.grantRead(new AccountRootPrincipal());


  this.modelHubBucket = s3Bucket;
  }
}
