import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export interface DynamodbTableProps {
    tableName: string;
    partitionKey: {
        name: string;
        type: dynamodb.AttributeType;
    };
    capacity?: number;
}

export class DynamodbTable extends Construct {
    public readonly table: dynamodb.Table;

    constructor(scope: Construct, id: string, props: DynamodbTableProps) {
        super(scope, id);

        const { tableName, partitionKey, capacity } = props;

        this.table = new dynamodb.Table(this, id, {
            tableName: tableName,
            partitionKey: partitionKey,
            readCapacity: capacity ? capacity : 5,
            writeCapacity: capacity ? capacity : 5,
            billingMode: dynamodb.BillingMode.PROVISIONED,
            removalPolicy: RemovalPolicy.DESTROY,
            pointInTimeRecovery: true,
        });
    }
}
