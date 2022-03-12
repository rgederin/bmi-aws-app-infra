import { Duration, CfnOutput } from 'aws-cdk-lib';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as autoscaling from 'aws-cdk-lib/aws-autoscaling';
import { Construct } from 'constructs';

interface ApplicationLoadBalancerProps {
    vpc: ec2.Vpc
    asg: autoscaling.AutoScalingGroup,
    securityGroup: ec2.SecurityGroup
}

export class ApplicationLoadBalancer extends Construct {
    public readonly applicationLoadBalancer: elbv2.ApplicationLoadBalancer;

    constructor(scope: Construct, id: string, props: ApplicationLoadBalancerProps) {
        super(scope, id);

        const { vpc, asg, securityGroup } = props;

        const alb = new elbv2.ApplicationLoadBalancer(this, 'alb', {
            vpc,
            internetFacing: true,
            securityGroup: securityGroup
        });

        const listener = alb.addListener('Listener', {
            port: 80,
            open: true,
        });

        listener.addTargets('default-target', {
            port: 80,
            targets: [asg],
            healthCheck: {
                path: '/',
                unhealthyThresholdCount: 2,
                healthyThresholdCount: 5,
                interval: Duration.seconds(30),
            },
        });

        listener.addAction('/static', {
            priority: 5,
            conditions: [elbv2.ListenerCondition.pathPatterns(['/static'])],
            action: elbv2.ListenerAction.fixedResponse(200, {
                contentType: 'text/html',
                messageBody: '<h1>Static ALB Response</h1>',
            }),
        });

        new CfnOutput(this, 'albDNS', {
            value: alb.loadBalancerDnsName,
        });
    }
}