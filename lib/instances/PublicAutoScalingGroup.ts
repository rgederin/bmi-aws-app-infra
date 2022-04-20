import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as autoscaling from 'aws-cdk-lib/aws-autoscaling';
import { Construct } from 'constructs';

interface PublicAutoScalingGroupProps {
    vpc: ec2.Vpc;
    securityGroup: ec2.SecurityGroup;
    keyName: string;
    dynamodbTable: string,
    sqsUrl: string,
    snsTopicArn: string
}

export class PublicAutoScalingGroup extends Construct {
    public readonly autoScalingGroup: autoscaling.AutoScalingGroup;

    constructor(scope: Construct, id: string, props: PublicAutoScalingGroupProps) {
        super(scope, id);

        const { vpc, keyName, securityGroup, dynamodbTable, sqsUrl, snsTopicArn } = props;
        const linuxAmi = new ec2.AmazonLinuxImage({
            generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
        });
        const userData = ec2.UserData.forLinux();

        userData.addCommands(
            'sudo su',
            'amazon-linux-extras install docker -y',
            'service docker start',
            'usermod -a -G docker ec2-user',
            'chkconfig docker on',
            'docker run --name bmi-api-service -p 80:8080 --env AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID} --env AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY} --env NODE_ENV=production --env AWS_REGION=us-west-2 --env DYNAMODB_TABLE=' 
                + dynamodbTable + ' --env SQS_URL=' 
                + sqsUrl + ' --env TOPIC_URL=' 
                + snsTopicArn + ' rgederin/bmi-api-image'
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
