import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Template, Capture } from 'aws-cdk-lib/assertions';
import { PrivateSecurityGroup } from '../../lib/security/PrivateSecurityGroup';

test('Private Security Group Created With Properties', () => {
    const stack = new cdk.Stack();

    const vpc = new ec2.Vpc(stack, 'my-cdk-vpc', {
        cidr: '10.0.0.0/16',
        natGateways: 0,
        subnetConfiguration: [
            { name: 'public', cidrMask: 24, subnetType: ec2.SubnetType.PUBLIC },
        ],
    });

    new PrivateSecurityGroup(stack, 'TestPublicSecurityGroup', {
        vpc
    });

    const template = Template.fromStack(stack);

    template.resourceCountIs('AWS::EC2::SecurityGroup', 1);
    template.hasResourceProperties('AWS::EC2::SecurityGroup', {

        SecurityGroupEgress: [{
            CidrIp: "0.0.0.0/0",
            "Description": "Allow all outbound traffic by default",
            IpProtocol: "-1"
        }],
        SecurityGroupIngress: [
            {
                Description: 'allow SSH access from the instances within vpc',
                FromPort: 22,
                IpProtocol: "tcp",
                ToPort: 22
            },
            {
                Description: 'allow ICMP access from the instances within vpc',
                FromPort: 8,
                IpProtocol: "icmp",
                ToPort: -1
            }
        ]
    });
});