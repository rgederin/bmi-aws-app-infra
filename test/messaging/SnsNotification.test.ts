import * as cdk from 'aws-cdk-lib';
import { Template, Capture } from 'aws-cdk-lib/assertions';
import { SnsNotification } from '../../lib/messaging/SnsNotification';

test('Sns Topic Created With Properties', () => {
    const stack = new cdk.Stack();

    new SnsNotification(stack, 'TestSnsTopic', {
        topicName: 'bmi-topic'
    });

    const template = Template.fromStack(stack);

    template.resourceCountIs('AWS::SNS::Topic', 1);
    template.hasResourceProperties('AWS::SNS::Topic', {
        TopicName: 'bmi-topic'
    });
});