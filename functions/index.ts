import { S3Event } from 'aws-lambda';
import * as AWS from 'aws-sdk';

exports.handler = async function (
  event: S3Event,
  context: any 
): Promise<any> {
  const bucketName = process.env.BUCKET_NAME || '';
  const objectKey = 'input-file.txt';

  const s3 = new AWS.S3();
  const params = { Bucket: bucketName, Key: objectKey };
  const response = await s3.getObject(params).promise();
  const data = response.Body?.toString('utf-8') || '';

  console.log('file contents:', data);

  return data
};
