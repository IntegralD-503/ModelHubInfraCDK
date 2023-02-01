// import * as cdk from 'aws-cdk-lib';
// import { AttributeType, BillingMode, Table } from "aws-cdk-lib/aws-dynamodb";
// import { Construct } from "constructs";

// interface DynamoDBStackProps extends cdk.StackProps {
//     readonly stageName: string;
//   }

// export class DynamoDBStack extends cdk.Stack {
//     public readonly modelHubDB: Table;
  
//     constructor(scope: Construct, id: string, props: DynamoDBStackProps) {
//       super(scope, id, props);
  
//       this.modelHubDB = new Table(this, 'ModelHubTable', { 
//         tableName: `ModelHubDB${props.stageName}`,
//         partitionKey: { name: 'id', type: AttributeType.STRING }, 
//         billingMode: BillingMode.PAY_PER_REQUEST, 
//       });
//     }
//   }
  