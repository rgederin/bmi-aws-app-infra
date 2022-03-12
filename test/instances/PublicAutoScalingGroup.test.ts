import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Template } from 'aws-cdk-lib/assertions';
import { PublicAutoScalingGroup } from '../../lib/instances/PublicAutoScalingGroup';

test('Public Auto Scaling Group Created', () => {
    const stack = new cdk.Stack(undefined, 'id', {
        env: { account: '530260462866', region: 'us-west-2' },
    });

    const vpc = new ec2.Vpc(stack, 'my-cdk-vpc', {
        cidr: '10.0.0.0/16',
        natGateways: 0,
        subnetConfiguration: [
            { name: 'public', cidrMask: 24, subnetType: ec2.SubnetType.PUBLIC, },
        ]
    });

    const securityGroup = new ec2.SecurityGroup(stack, 'test-security-group', {
        vpc,
        allowAllOutbound: true,
    });

    new PublicAutoScalingGroup(stack, 'test-private-ec2', {
        vpc, securityGroup,
        keyName: 'test-key-name'
    })

    const template = Template.fromStack(stack);

    template.resourceCountIs('AWS::AutoScaling::AutoScalingGroup', 1);
});