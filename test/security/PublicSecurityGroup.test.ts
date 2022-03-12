import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Template } from 'aws-cdk-lib/assertions';
import { PublicSecurityGroup } from '../../lib/security/PublicSecurityGroup';

test('Public Security Group Created With Properties', () => {
    const stack = new cdk.Stack();

    const vpc = new ec2.Vpc(stack, 'test-vpc', {
        cidr: '10.0.0.0/16',
        natGateways: 0,
        subnetConfiguration: [
            { name: 'public', cidrMask: 24, subnetType: ec2.SubnetType.PUBLIC },
        ],
    });

    new PublicSecurityGroup(stack, 'TestPublicSecurityGroup', {
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
                CidrIp: "0.0.0.0/0",
                Description: "allow SSH access from anywhere",
                FromPort: 22,
                IpProtocol: "tcp",
                ToPort: 22
            },
            {
                CidrIp: "0.0.0.0/0",
                Description: "allow HTTP traffic from anywhere",
                FromPort: 80,
                IpProtocol: "tcp",
                ToPort: 80
            },
            {
                CidrIp: "0.0.0.0/0",
                Description: "allow HTTPS traffic from anywhere",
                FromPort: 443,
                IpProtocol: "tcp",
                ToPort: 443
            }
        ]
    });
});