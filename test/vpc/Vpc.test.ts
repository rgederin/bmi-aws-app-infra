import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { Vpc } from '../../lib/vpc/Vpc'


test('VPC Created', () => {
    const stack = new cdk.Stack(undefined, 'id', {
        env: { account: '530260462866', region: 'us-west-2' },
    });

    new Vpc(stack, 'test-vpc', { vpcCidr: '10.0.0.0/16' });

    const template = Template.fromStack(stack);

    template.resourceCountIs('AWS::EC2::VPC', 1);
    template.resourceCountIs('AWS::EC2::Subnet', 4);
});