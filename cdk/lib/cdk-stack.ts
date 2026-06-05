import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3Deployment from 'aws-cdk-lib/aws-s3-deployment';
import { Construct } from 'constructs';

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    const myBucket = new s3.Bucket(this, `${process.env.STAGE}-${process.env.PROJECT}-earthdata-dashboard`, {
      publicReadAccess: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ACLS,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      websiteIndexDocument: "index.html"
    });

    const root = new s3Deployment.BucketDeployment(this, "deployStaticWebsite", {
      sources: [s3Deployment.Source.asset("../dist")],
      destinationBucket: myBucket,
      retainOnDelete: true
    });

    const maap_biomass = new s3Deployment.BucketDeployment(this, "deployStaticWebsiteSubDir", {
      sources: [s3Deployment.Source.asset("../dist")],
      destinationBucket: myBucket,
      destinationKeyPrefix: "maap-biomass/"
    });

    maap_biomass.node.addDependency(root);

  }
}
