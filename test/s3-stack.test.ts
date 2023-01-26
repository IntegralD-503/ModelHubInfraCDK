import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { S3Stack } from '../lib/s3-stack';

// example test. To run these tests, uncomment this file along with the
// example resource in lib/v0-stack.ts
test('S3 Stack Created', () => {
  const app = new cdk.App();
    // WHEN
  const stack = new S3Stack(app, 'MyTestStack');
    // THEN
  const template = Template.fromStack(stack);

  template.hasResourceProperties('AWS::S3::Bucket', {
    
  });
});
