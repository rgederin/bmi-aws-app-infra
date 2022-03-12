import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Template, Capture } from 'aws-cdk-lib/assertions';
import { PrivateEC2Instance } from '../../lib/instances/PrivateEC2Instance';

test('Privare EC2 instance Created', () => {
    const stack = new cdk.Stack(undefined, 'id', {
        env: { account: '530260462866', region: 'us-west-2' },
    });

    const vpc = new ec2.Vpc(stack, 'my-cdk-vpc', {
        cidr: '10.0.0.0/16',
        natGateways: 1,
        natGatewayProvider: ec2.NatProvider.instance({
            instanceType: new ec2.InstanceType('t2.micro'),
        }),
        subnetConfiguration: [
            { name: 'public', cidrMask: 24, subnetType: ec2.SubnetType.PUBLIC, },
            { name: 'private', cidrMask: 24, subnetType: ec2.SubnetType.PRIVATE_WITH_NAT },
        ],
    });

    const securityGroup = new ec2.SecurityGroup(stack, 'test-security-group', {
        vpc,
        allowAllOutbound: true,
    });

    new PrivateEC2Instance(stack, 'test-private-ec2', {
        vpc, securityGroup,
        keyName: 'test-key-name'
    })

    const template = Template.fromStack(stack);

    template.resourceCountIs('AWS::EC2::Instance', 2);
});