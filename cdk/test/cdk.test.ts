import { Template } from 'aws-cdk-lib/assertions';
import * as cdk from 'aws-cdk-lib';
import * as Cdk from '../lib/cdk-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new Cdk.CdkStack(app, 'MyTestStack');
    // THEN
    const template = Template.fromStack(stack);
    template.templateMatches({
      "Resources": {}
    });
});
