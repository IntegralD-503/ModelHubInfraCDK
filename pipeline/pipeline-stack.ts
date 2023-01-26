import { SecretValue, Stack, StackProps } from "aws-cdk-lib";
import { PipelineProject, LinuxBuildImage, BuildSpec } from "aws-cdk-lib/aws-codebuild";
import { Artifact, Pipeline } from "aws-cdk-lib/aws-codepipeline";
import { CloudFormationCreateUpdateStackAction, CodeBuildAction, GitHubSourceAction } from "aws-cdk-lib/aws-codepipeline-actions";
import { Construct } from "constructs";

export class PipelineStack extends Stack {
    private readonly pipeline: Pipeline;
    private readonly cdkBuildOutput: Artifact;
    private readonly modelHubAPISourceOutput: Artifact;
    private readonly modelHubAPIBuildOutput: Artifact;

    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);


        this.pipeline = new Pipeline(this, 'ModelHubPipeline', {
            pipelineName: 'ModelHubPipeline',
            crossAccountKeys: false,
            restartExecutionOnUpdate: true
          });
      
          const cdkSourceOutput = new Artifact('ModelHubCDKOutput');
          this.modelHubAPISourceOutput = new Artifact('ModelHubApiSourceOutput');
      
          this.pipeline.addStage({
            stageName:'Source',
            actions:[
              new GitHubSourceAction({
                owner: 'IntegralD-503',
                repo: 'ModelHubInfraCDK',
                branch: 'master',
                actionName: 'ModelHubPipeline_Source',
                oauthToken: SecretValue.secretsManager('github-token'),
                output: cdkSourceOutput
              }),
              new GitHubSourceAction({
                owner: 'IntegralD-503',
                repo: 'ModelHubAPI',
                branch: 'main',
                actionName: 'ModelHubAPI_Source',
                oauthToken: SecretValue.secretsManager('github-token'),
                output: this.modelHubAPISourceOutput
              })
            ]
          });

          this.cdkBuildOutput = new Artifact("CdkBuildOutput");
          this.modelHubAPIBuildOutput = new Artifact("ModelHubAPIBuildOutput");
      
          this.pipeline.addStage({
            stageName: 'Build',
            actions: [
              new CodeBuildAction({
                actionName: 'CDK_Build',
                input: cdkSourceOutput,
                outputs: [ this.cdkBuildOutput ],
                project: new PipelineProject(this, 'CdkBuildProject', {
                  environment: {
                    buildImage: LinuxBuildImage.AMAZON_LINUX_2_4
                  },
                  buildSpec: BuildSpec.fromSourceFilename('build-specs/cdk-build-spec.yml')
                })
              }),
              new CodeBuildAction({
                actionName: 'ModelHubAPI_Build',
                input: this.modelHubAPISourceOutput,
                outputs: [ this.modelHubAPIBuildOutput ],
                project: new PipelineProject(this, 'ModelHubAPIBuildProject', {
                  environment: {
                    buildImage: LinuxBuildImage.AMAZON_LINUX_2_4
                  },
                  buildSpec: BuildSpec.fromSourceFilename('build-specs/modelhub-api-build-spec.yml')
                })
              })
            ]
          });

          this.pipeline.addStage({
            stageName: 'Pipeline_Update',
            actions: [
              new CloudFormationCreateUpdateStackAction({
                actionName: 'ModelHubPipeline_Update',
                stackName: 'ModelHubPipelineStack',
                templatePath: this.cdkBuildOutput.atPath('ModelHubPipelineStack.template.json'),
                adminPermissions: true,
              })
            ]
          });


    }
}