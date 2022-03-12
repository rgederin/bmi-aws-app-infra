import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Vpc } from './vpc/Vpc';
import { ApplicationLoadBalancer } from './balancing/ApplicationLoadBalancer';
import { PublicSecurityGroup } from './security/PublicSecurityGroup';
import { PrivateSecurityGroup } from './security/PrivateSecurityGroup';
import { PublicAutoScalingGroup } from './instances/PublicAutoScalingGroup';
import { PrivateEC2Instance } from './instances/PrivateEC2Instance';
import { SnsNotification } from './messaging/SnsNotification';
import { SqsQueue } from './messaging/SqsQueue';
import { DynamodbTable } from './storages/DynamodbTable';
import { RdsInstance } from './storages/RdsInstance';

export class BmiAwsAppInfraStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const bmiAppVpc = new Vpc(this, 'bmi-app-vpc', {
      vpcCidr: '10.0.0.0/16',
    });

    const publicSecurityGroup = new PublicSecurityGroup(this, 'bmi-public-security-group', {
      vpc: bmiAppVpc.vpc
    });

    const privateSecurityGroup = new PrivateSecurityGroup(this, 'bmi-private-security-group', {
      vpc: bmiAppVpc.vpc
    });

    const publicAutoscalingGroup = new PublicAutoScalingGroup(this, 'bmi-public-instances', {
      vpc: bmiAppVpc.vpc,
      securityGroup: publicSecurityGroup.securityGroup,
      keyName: 'rgederin-lohika-2021-us-west-2',
    });

    const privateEc2Instace = new PrivateEC2Instance(this, 'bmi-private-ec2', {
      vpc: bmiAppVpc.vpc,
      securityGroup: privateSecurityGroup.securityGroup,
      keyName: 'rgederin-lohika-2021-us-west-2',
    })

    const applicationLoadBalancer = new ApplicationLoadBalancer(this, 'bmi-load-balancer', {
      vpc: bmiAppVpc.vpc,
      asg: publicAutoscalingGroup.autoScalingGroup,
      securityGroup: publicSecurityGroup.securityGroup
    });

    const sqsQueue = new SqsQueue(this, 'bmi-sqs', { queueName: 'bmi-queue' });
    const snsTopic = new SnsNotification(this, 'bmi-sns', { topicName: 'bmi-topic' });

    const dynamodbTable = new DynamodbTable(this, 'bmi-dynamodb', {
      tableName: 'bmi-table',
      partitionKey: {
        name: 'id',
        type: dynamodb.AttributeType.STRING,
      },
    });

    const rdsInstance = new RdsInstance(this, 'bmi-rds', {
      vpc: bmiAppVpc.vpc,
      securityGroup: privateSecurityGroup.securityGroup,
      databaseName: 'bmi'
    });

    dynamodbTable.table.grantFullAccess(publicAutoscalingGroup.autoScalingGroup);

    sqsQueue.sqs.grantSendMessages(publicAutoscalingGroup.autoScalingGroup);
    snsTopic.topic.grantPublish(publicAutoscalingGroup.autoScalingGroup);

    sqsQueue.sqs.grantConsumeMessages(privateEc2Instace.instance);
    snsTopic.topic.grantPublish(privateEc2Instace.instance);
  }
}
}
