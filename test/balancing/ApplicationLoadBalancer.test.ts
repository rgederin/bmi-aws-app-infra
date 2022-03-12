import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Template } from 'aws-cdk-lib/assertions';
import * as autoscaling from 'aws-cdk-lib/aws-autoscaling';
import { ApplicationLoadBalancer } from '../../lib/balancing/ApplicationLoadBalancer'
import { PublicAutoScalingGroup } from '../../lib/instances/PublicAutoScalingGroup'

test('Application Load Balancer instance Created', () => {
    const stack = new cdk.Stack(undefined, 'id', {
        env: { account: '530260462866', region: 'us-west-2' },
    });

    const vpc = new ec2.Vpc(stack, 'test-vpc', {
        cidr: '10.0.0.0/16',
        natGateways: 0,
        subnetConfiguration: [
            { name: 'public', cidrMask: 24, subnetType: ec2.SubnetType.PUBLIC, },
        ],
    });

    const securityGroup = new ec2.SecurityGroup(stack, 'test-security-group', {
        vpc,
        allowAllOutbound: true,
    });

    const asg = new PublicAutoScalingGroup(stack, 'test-private-ec2', {
        vpc, securityGroup,
        keyName: 'test-key-name'
    });

    new ApplicationLoadBalancer(stack, 'test-alb', {
        vpc, securityGroup, asg: asg.autoScalingGroup
    });

    const template = Template.fromStack(stack);

    template.resourceCountIs('AWS::ElasticLoadBalancingV2::LoadBalancer', 1);
});