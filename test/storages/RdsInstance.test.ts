import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Template } from 'aws-cdk-lib/assertions';
import { RdsInstance } from '../../lib/storages/RdsInstance'


test('RDS instance Created', () => {
    const stack = new cdk.Stack(undefined, 'id', {
        env: { account: '530260462866', region: 'us-west-2' },
    });

    const vpc = new ec2.Vpc(stack, 'test-vpc', {
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

    new RdsInstance(stack, 'test-rds-instance', {
        vpc, securityGroup,
        databaseName: 'test-db'
    })

    const template = Template.fromStack(stack);

    template.resourceCountIs('AWS::RDS::DBInstance', 1);

    template.hasResourceProperties('AWS::RDS::DBInstance', {
        DBInstanceClass: 'db.t3.micro',
        AllocatedStorage: '10',
        DBName: 'test-db',
        Engine: 'postgres',
        PubliclyAccessible: false,
        MultiAZ: false
    });
});