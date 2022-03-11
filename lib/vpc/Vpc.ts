import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

interface BmiVpcProps {
    vpcCidr: string;
}

export class Vpc extends Construct {
    public readonly vpc: ec2.Vpc;

    constructor(scope: Construct, id: string, props: BmiVpcProps) {
        super(scope, id);

        this.vpc = new ec2.Vpc(this, id, {
            natGatewayProvider: ec2.NatProvider.instance({
                instanceType: new ec2.InstanceType('t2.micro'),
            }),
            cidr: props.vpcCidr,
            natGateways: 1,
            maxAzs: 2,
            subnetConfiguration: [
                {
                    name: 'bmi-public-subnet',
                    cidrMask: 24,
                    subnetType: ec2.SubnetType.PUBLIC,
                },
                {
                    name: 'bmi-private-subnet-1',
                    cidrMask: 24,
                    subnetType: ec2.SubnetType.PRIVATE_WITH_NAT
                },
            ],
        });
    }
}
