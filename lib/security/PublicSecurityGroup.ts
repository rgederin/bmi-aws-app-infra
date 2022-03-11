import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

interface PublicSecurityGroupProps {
    vpc: ec2.Vpc;
}

export class PublicSecurityGroup extends Construct {
    public readonly securityGroup: ec2.SecurityGroup;

    constructor(scope: Construct, id: string, props: PublicSecurityGroupProps) {
        super(scope, id);

        this.securityGroup = new ec2.SecurityGroup(
            this, id, {
            vpc: props.vpc,
            allowAllOutbound: true,
        });

        this.securityGroup.addIngressRule(
            ec2.Peer.anyIpv4(),
            ec2.Port.tcp(22),
            'allow SSH access from anywhere'
        );

        this.securityGroup.addIngressRule(
            ec2.Peer.anyIpv4(),
            ec2.Port.tcp(80),
            'allow HTTP traffic from anywhere'
        );

        this.securityGroup.addIngressRule(
            ec2.Peer.anyIpv4(),
            ec2.Port.tcp(443),
            'allow HTTPS traffic from anywhere'
        );
    }
}
