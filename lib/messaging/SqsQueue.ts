import * as sqs from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';

interface SqsQueueProps {
    queueName: string;
}

export class SqsQueue extends Construct {
    public readonly sqs: sqs.Queue;

    constructor(scope: Construct, id: string, props: SqsQueueProps) {
        super(scope, id);

        this.sqs = new sqs.Queue(this, id, {
            queueName: props.queueName,
        });
    }
}
