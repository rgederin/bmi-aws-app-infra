#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { BmiAwsAppInfraStack } from '../lib/bmi-aws-app-infra-stack';

const app = new cdk.App();
new BmiAwsAppInfraStack(app, 'BmiAwsAppStack', {
  env: { account: '530260462866', region: 'us-west-2' },
});