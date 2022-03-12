import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Template } from 'aws-cdk-lib/assertions';
import { DynamodbTable } from '../../lib/storages/DynamodbTable';

test('Dynamodb Table Created With Properties', () => {
    const stack = new cdk.Stack();

    new DynamodbTable(stack, 'TestDynamoDbTable', {
        tableName: 'bmi-table',
        partitionKey: {
            name: 'id',
            type: dynamodb.AttributeType.STRING,
        },
    });

    const template = Template.fromStack(stack);

    template.resourceCountIs('AWS::DynamoDB::Table', 1);
    template.hasResourceProperties('AWS::DynamoDB::Table', {
        TableName: 'bmi-table',
        ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5,
        },
    });
});