import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

interface PrivateEC2InstanceProps {
    vpc: ec2.Vpc;
    securityGroup: ec2.SecurityGroup;
    role?: iam.Role;
    keyName: string;
}

export class PrivateEC2Instance extends Construct {
    public readonly instance: ec2.Instance;

    constructor(scope: Construct, id: string, props: PrivateEC2InstanceProps) {
        super(scope, id);

        const { vpc, securityGroup, role, keyName } = props;

        const linuxAmi = new ec2.AmazonLinuxImage({
            generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
        });

        this.instance = new ec2.Instance(this, id, {
            vpc,
            vpcSubnets: {
                subnetType: ec2.SubnetType.PRIVATE_WITH_NAT
            },
            role: role,
            securityGroup: securityGroup,
            instanceType: ec2.InstanceType.of(
                ec2.InstanceClass.T2,
                ec2.InstanceSize.MICRO
            ),
            machineImage: linuxAmi,
            keyName: keyName,
        });
    }
}
