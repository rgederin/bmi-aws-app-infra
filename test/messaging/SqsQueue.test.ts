import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { SqsQueue } from '../../lib/messaging/SqsQueue';

test('Sqs Queue Created With Properties', () => {
    const stack = new cdk.Stack();

    new SqsQueue(stack, 'TestSqsQueue', {
        queueName: 'bmi-queue'
    });

    const template = Template.fromStack(stack);

    template.resourceCountIs('AWS::SQS::Queue', 1);
    template.hasResourceProperties('AWS::SQS::Queue', {
        QueueName: 'bmi-queue'
    });
});