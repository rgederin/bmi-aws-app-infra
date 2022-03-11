import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

interface PublicSecurityGroupProps {
    vpc: ec2.Vpc;
}

export class PrivateSecurityGroup extends Construct {
    public readonly securityGroup: ec2.SecurityGroup;

    constructor(scope: Construct, id: string, props: PublicSecurityGroupProps) {
        super(scope, id);

        this.securityGroup = new ec2.SecurityGroup(
            this, id, {
            vpc: props.vpc,
            allowAllOutbound: true,
        }
        );

        this.securityGroup.addIngressRule(
            ec2.Peer.ipv4(props.vpc.vpcCidrBlock),
            ec2.Port.tcp(22),
            'allow SSH access from the instances within vpc'
        );

        this.securityGroup.addIngressRule(
            ec2.Peer.ipv4(props.vpc.vpcCidrBlock),
            ec2.Port.icmpPing(),
            'allow ICMP access from the instances within vpc'
        );
    }
}
