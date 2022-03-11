import * as sns from 'aws-cdk-lib/aws-sns';
import * as subscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
import { Construct } from 'constructs';

interface SnsNotificationProps {
    topicName: string;
}

export class SnsNotification extends Construct {
    public readonly topic: sns.Topic;

    constructor(scope: Construct, id: string, props: SnsNotificationProps) {
        super(scope, id);

        const topicName = props.topicName;

        this.topic = new sns.Topic(this, id, {
            displayName: id,
            topicName: topicName,
        });

        this.topic.addSubscription(new subscriptions.EmailSubscription('rgederin@lohika.com'));
    }
}
