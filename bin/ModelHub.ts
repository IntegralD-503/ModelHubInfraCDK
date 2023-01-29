#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { S3Stack } from '../lib/s3-stack';
import { ModelHubApiStack } from '../lib/model-hub-api';
import { PipelineStack } from '../pipeline/pipeline-stack';

const app = new cdk.App();
const pipelineStack = new PipelineStack(app, 'ModelHubPipelineStack',{});

const s3Stack = new S3Stack(app, 'S3Stack', {});

const apiStackBeta = new ModelHubApiStack(app, 'ModelHubAPIStackBeta', {
  s3Bucket: s3Stack.modelHubBucket,
  stageName: 'Beta'
});

pipelineStack.addModelHubAPIStage(apiStackBeta, "Beta");