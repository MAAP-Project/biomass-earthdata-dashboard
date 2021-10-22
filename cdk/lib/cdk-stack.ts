import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3'
import * as s3Deployment from '@aws-cdk/aws-s3-deployment'

export class CdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    const myBucket = new s3.Bucket(this, `${process.env.STAGE}-${process.env.PROJECT}-earthdata-dashboard`, {
      publicReadAccess: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      websiteIndexDocument: "index.html"
    });

    new s3Deployment.BucketDeployment(this, "deployStaticWebsite", {
      sources: [s3Deployment.Source.asset("../dist")],
      destinationBucket: myBucket
    });

    new s3Deployment.BucketDeployment(this, "deployStaticWebsiteSubDir", {
      sources: [s3Deployment.Source.asset("../dist")],
      destinationBucket: myBucket,
      destinationKeyPrefix: "biomass/"
    });
  }
}
