import { Duration, RemovalPolicy, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

interface RdsInstanceProps {
    vpc: ec2.Vpc
    securityGroup: ec2.SecurityGroup,
    databaseName: string
}
export class RdsInstance extends Construct {
    public readonly instance: rds.DatabaseInstance;

    constructor(scope: Construct, id: string, props: RdsInstanceProps) {
        super(scope, id);

        const { vpc, securityGroup, databaseName } = props;

        this.instance = new rds.DatabaseInstance(this, id, {
            vpc: vpc,
            vpcSubnets: {
                subnetType: ec2.SubnetType.PRIVATE_WITH_NAT,
            },
            engine: rds.DatabaseInstanceEngine.postgres({
                version: rds.PostgresEngineVersion.VER_13_4
            }),
            instanceType: ec2.InstanceType.of(
                ec2.InstanceClass.BURSTABLE3,
                ec2.InstanceSize.MICRO,
            ),
            credentials: rds.Credentials.fromGeneratedSecret('postgres'),
            multiAz: false,
            allocatedStorage: 10,
            maxAllocatedStorage: 11,
            allowMajorVersionUpgrade: false,
            autoMinorVersionUpgrade: true,
            backupRetention: Duration.days(0),
            deleteAutomatedBackups: true,
            removalPolicy: RemovalPolicy.DESTROY,
            deletionProtection: false,
            databaseName: databaseName,
            publiclyAccessible: false,
        });

        this.instance.connections.allowFrom(securityGroup, ec2.Port.tcp(5432));

        new CfnOutput(this, 'dbEndpoint', {
            value: this.instance.instanceEndpoint.hostname,
        });

        new CfnOutput(this, 'secretName', {
            value: this.instance.secret?.secretName!,
        });
    }
}