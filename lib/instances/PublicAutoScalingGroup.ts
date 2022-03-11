import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as autoscaling from 'aws-cdk-lib/aws-autoscaling';
import { Construct } from 'constructs';

interface PublicAutoScalingGroupProps {
    vpc: ec2.Vpc;
    securityGroup: ec2.SecurityGroup;
    keyName: string;
}

export class PublicAutoScalingGroup extends Construct {
    public readonly autoScalingGroup: autoscaling.AutoScalingGroup;

    constructor(scope: Construct, id: string, props: PublicAutoScalingGroupProps) {
        super(scope, id);

        const { vpc, keyName, securityGroup } = props;
        const linuxAmi = new ec2.AmazonLinuxImage({
            generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
        });
        const userData = ec2.UserData.forLinux();

        userData.addCommands(
            'sudo su',
            'yum install -y httpd',
            'systemctl start httpd',
            'systemctl enable httpd',
            'echo "<h1>Hello World from $(hostname -f)</h1>" > /var/www/html/index.html',
        );

        this.autoScalingGroup = new autoscaling.AutoScalingGroup(this, id, {
            autoScalingGroupName: id,
            vpc: vpc,
            maxCapacity: 3,
            minCapacity: 2,
            instanceType: ec2.InstanceType.of(
                ec2.InstanceClass.T2,
                ec2.InstanceSize.MICRO
            ),
            machineImage: linuxAmi,
            securityGroup: securityGroup,
            keyName: keyName,
            vpcSubnets: {
                subnetType: ec2.SubnetType.PUBLIC,
            },
            userData: userData
        });
    }
}
