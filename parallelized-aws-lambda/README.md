# Parallelized Rendering with AWS Lambda

This example project demonstrates how you can perform parallelized rendering of Revideo projects using AWS Lambda and comes with docker images for Revideo (specifically for running Revideo on Lambda). 

The code inside of `/revideo-project` has the same structure as any revideo project. Additionally, it contains the `src/lambda.ts` file which defines a handler for a lambda function. Within this repository, we also have two Docker images:

- `Dockerfile.base` is a base image that sets up the environment required to run Revideo on Lambda. A built image can already be found at `docker.io/revideo/aws-lambda-base-image:latest`, the Dockerfile is only included for reference.
- `Dockerfile` uses `Dockerfile.base` as a base image and builds the Revideo project inside of `revideo-project`. You should build this image yourself to use it with AWS Lambda.


## How it works

The handler that gets executed when the lambda function is invoked can be found in `./src/lambda.ts`. This handler does the following:

- when the handler receives a request with a `"jobType": "fullRender"` argument, it invokes itself `numWorkers` of times with `"jobType": "partialRender"`.
- each lambda function called with `"jobType": "partialRender"` will call `renderPartialVideo` to render a part of the video. The result will be uploaded to an AWS bucket.
- the main lambda function will await all partial render jobs and then merge their results. The resulting full video gets uploaded to the same AWS bucket.

## Getting Started

Here's how you can set up your example project on AWS Lambda:

### Assign Permissions

We will first create users and roles to obtain the neccessary permissions for creating, managing and running lambda functions:

#### 1. Create role policy

- Go to [AWS account IAM Policies section](https://console.aws.amazon.com/iamv2/home?#/policies). Now click on **"Create Policy"** and then click on **"JSON"**
- Paste the following JSON into the Policy field:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "0",
      "Effect": "Allow",
      "Action": [
        "s3:ListAllMyBuckets"
      ],
      "Resource": [
        "*"
      ]
    },
    {
      "Sid": "1",
      "Effect": "Allow",
      "Action": [
        "s3:CreateBucket",
        "s3:ListBucket",
        "s3:PutBucketAcl",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:PutObjectAcl",
        "s3:PutObject",
        "s3:GetBucketLocation"
      ],
      "Resource": [
        "arn:aws:s3:::revideo-*"
      ]
    },
    {
      "Sid": "2",
      "Effect": "Allow",
      "Action": [
        "lambda:InvokeFunction"
      ],
      "Resource": [
        "arn:aws:lambda:*:*:function:revideo-*"
      ]
    },
    {
      "Sid": "3",
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup"
      ],
      "Resource": [
        "arn:aws:logs:*:*:log-group:/aws/lambda-insights"
      ]
    },
    {
      "Sid": "4",
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": [
        "arn:aws:logs:*:*:log-group:/aws/lambda/revideo-*",
        "arn:aws:logs:*:*:log-group:/aws/lambda-insights:*"
      ]
    },
    {
        "Sid": "CreateLambdaLogGroup",
        "Effect": "Allow",
        "Action": [
            "logs:CreateLogGroup"
        ],
        "Resource": [
            "arn:aws:logs:*:*:log-group:/aws/lambda/revideo-*"
        ]
    },
    {
        "Sid": "ECRAccess",
        "Effect": "Allow",
        "Action": [
            "ecr:GetAuthorizationToken",
            "ecr:BatchCheckLayerAvailability",
            "ecr:GetDownloadUrlForLayer",
            "ecr:BatchGetImage",
            "ecr:InitiateLayerUpload",
            "ecr:GetRepositoryPolicy",
            "ecr:SetRepositoryPolicy"
        ],
        "Resource": "*"
    }
  ]
}
```
- Click next. On the tags page, you don't need to fill in anything. Click next again.
- Give the policy **exactly** the name `revideo-lambda-policy` in the "Policy Name" field. No other changes are needed.


#### 2. Create a role

- Go to [AWS account IAM Roles section](https://console.aws.amazon.com/iamv2/home#/roles). Now click "Create role", and under "Use Cases", select "Lambda". Now click next.
- Under "Permissions policies", filter for `revideo-lambda-policy` and click the checkbox to assign this policy. Click next.
- In the final step, name the role `revideo-lambda-role` **exactly**. Don't change anything else.
- Click "Create role" to confirm. Note down the arn of the role as you will need it later.

#### 3. Create a user

- Go to [AWS account IAM Users section](https://console.aws.amazon.com/iamv2/home#/users). Now click **"Add users"** and enter a username for your user, such as `revideo-user`.
- **Don't check** the "Enable console access" option. You don't need it.
- Click "Next", and click "Next" again on the next page. You should now be at the Review and Create" step.
- Click "Create user".

#### 4. Create an access key for the user

- Go to [AWS account IAM Users section](https://console.aws.amazon.com/iamv2/home#/users)
- Click on the name of the user that was created in step 3 (`revideo-user`).
- Navigate to the "Security Credentials" tab, and scroll down to the "Access Keys" section.
- Click the "Create access key" button.
- Select "Application running on an AWS compute service".
- Ignore warnings that might appear and check the "I understand the recommendations..." checkbox.
- Click "Next".
- Click "Create access key".

Note down your access key id and secret access key as you will need them later.

#### 5. Add permissions to your user

- Go to [AWS account IAM Users section](https://console.aws.amazon.com/iamv2/home#/users)
- Select the user you just created.
- Click "Add inline policy" under the "Add Permissions" dropdown in the "Permissions policies" panel.
- Click the tab "JSON".
- Paste the following policy into the text field:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "HandleQuotas",
      "Effect": "Allow",
      "Action": [
        "servicequotas:GetServiceQuota",
        "servicequotas:GetAWSDefaultServiceQuota",
        "servicequotas:RequestServiceQuotaIncrease",
        "servicequotas:ListRequestedServiceQuotaChangeHistoryByQuota"
      ],
      "Resource": [
        "*"
      ]
    },
    {
      "Sid": "PermissionValidation",
      "Effect": "Allow",
      "Action": [
        "iam:SimulatePrincipalPolicy"
      ],
      "Resource": [
        "*"
      ]
    },
    {
      "Sid": "LambdaInvokation",
      "Effect": "Allow",
      "Action": [
        "iam:PassRole"
      ],
      "Resource": [
        "arn:aws:iam::*:role/revideo-lambda-role"
      ]
    },
    {
      "Sid": "Storage",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:PutObjectAcl",
        "s3:PutObject",
        "s3:CreateBucket",
        "s3:ListBucket",
        "s3:GetBucketLocation",
        "s3:PutBucketAcl",
        "s3:DeleteBucket",
        "s3:PutBucketOwnershipControls",
        "s3:PutBucketPublicAccessBlock",
        "s3:PutLifecycleConfiguration"
      ],
      "Resource": [
        "arn:aws:s3:::revideo-*"
      ]
    },
    {
      "Sid": "BucketListing",
      "Effect": "Allow",
      "Action": [
        "s3:ListAllMyBuckets"
      ],
      "Resource": [
        "*"
      ]
    },
    {
      "Sid": "FunctionListing",
      "Effect": "Allow",
      "Action": [
        "lambda:ListFunctions",
        "lambda:GetFunction"
      ],
      "Resource": [
        "*"
      ]
    },
    {
      "Sid": "FunctionManagement",
      "Effect": "Allow",
      "Action": [
        "lambda:InvokeAsync",
        "lambda:InvokeFunction",
        "lambda:CreateFunction",
        "lambda:UpdateFunctionCode",
        "lambda:DeleteFunction",
        "lambda:PutFunctionEventInvokeConfig",
        "lambda:PutRuntimeManagementConfig",
        "lambda:TagResource"
      ],
      "Resource": [
        "arn:aws:lambda:*:*:function:revideo-*"
      ]
    },
    {
      "Sid": "LogsRetention",
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:PutRetentionPolicy"
      ],
      "Resource": [
        "arn:aws:logs:*:*:log-group:/aws/lambda/revideo-*"
      ]
    },
    {
        "Sid": "ECRPermissions",
        "Effect": "Allow",
		"Action": [
				"ecr:GetAuthorizationToken",
				"ecr:BatchCheckLayerAvailability",
				"ecr:GetDownloadUrlForLayer",
				"ecr:GetRepositoryPolicy",
				"ecr:DescribeRepositories",
				"ecr:ListImages",
				"ecr:DescribeImages",
				"ecr:BatchGetImage",
				"ecr:InitiateLayerUpload",
				"ecr:UploadLayerPart",
				"ecr:CompleteLayerUpload",
				"ecr:PutImage",
				"ecr:SetRepositoryPolicy"
		],
        "Resource": "*"
    }
  ]
}
```

- Click "Review policy".
- Give the policy a name. For example `revideo-user-policy`, but it can be anything.
- Click "Create policy" to confirm.

### Deploy your Lambda Function

We assume that you've cloned or donwloaded the parallelized lambda example and are now in the root directory of the project.

We will now set up the AWS resources you need to deploy your project. To do so, first make sure that the AWS CLI is operated by the user we just granted the neccessary permissions by setting the credentials from bullet point 4 of the previous section:

```
export AWS_ACCESS_KEY_ID=<your-access-key-id>
export AWS_SECRET_ACCESS_KEY=<your-secret-access-key>
export AWS_DEFAULT_REGION=<your-aws-region>
```

#### Create A Bucket

First, create a bucket to store your renders as well as the partial renders that get merged:

- Head to the [S3 Dashboard](https://eu-central-1.console.aws.amazon.com/s3) and make sure that you're in the region you want your bucket to be in.
- Click "Create Bucket".
- Give the bucket a name that starts with "revideo-", untick "Block all Public Access" and acknowledge the warning by ticking its box
- Confirm by clicking "Create Bucket"
- Click onto your Bucket and head to the tab "Permissions"

Now paste the following into the "Bucket Policy" field:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::<your-bucket-name>/*"
        },
        {
            "Sid": "AllowUserToWriteObjects",
            "Effect": "Allow",
            "Principal": {
                "AWS": "<your-user-arn>"
            },
            "Action": "s3:PutObject",
            "Resource": "arn:aws:s3:::<your-bucket-name>/*"
        }
    ]
}
```

Also paste the following into the field "Cross-origin resource sharing (CORS)" and click:

```json
[
    {
        "AllowedHeaders": [
            "*"
        ],
        "AllowedMethods": [
            "GET",
            "HEAD"
        ],
        "AllowedOrigins": [
            "*"
        ],
        "ExposeHeaders": [
            "ETag"
        ],
        "MaxAgeSeconds": 3000
    }
]
```


#### Build Docker Image & Push to ECR

We want to upload our docker image to Amazon's container registry so that it is close to our lambda function. To create an ECR repository, run the following command. 

```
aws ecr create-repository --repository-name revideo-render-project
```

This will give you the URI of your ECR repository `<your-ecr-uri>`, which looks something like `0123456789.dkr.ecr.us-east-1.amazonaws.com/your-repo-name`.

Now you can build the docker image. To do so, head to the folder in which our `Dockerfile` is present and run:

```
docker buildx build --progress=plain --platform linux/amd64 -t revideo-render-project:latest .
```

Now tag the image to upload it to ECR:

```
docker tag revideo-render-project:latest <your-ecr-uri>:latest
```

Finally, to push the image, you have to authenticate Docker with ECR. To do so, run the following command:

```
aws ecr get-login-password --region <your-region> | docker login --username AWS --password-stdin <your-ecr-uri>
```

Now push the image to your repository:
```
docker push <your-ecr-uri>:latest
```

You can now create a lambda function from your docker image. The `<your-lambda-role-arn>` field should be filled out by the arn that was returned in step 2 ("Create a Role").

```
aws lambda create-function \
    --function-name revideo-render-function \
    --package-type Image \
    --code ImageUri=<your-ecr-uri>:latest \
    --role <your-lambda-role-arn> \
    --timeout 900 \
    --memory-size 3000 \
    --environment Variables={REVIDEO_BUCKET_NAME=<your-bucket-name>}
```

You should get a response in your terminal indicating that your function is being created.


#### Test your function

To test your function, head to the Lambda tab in the AWS console. Now create a test event with the following arguments and use it to invoke your function:

```json
{
  "jobId": "12345",
  "numWorkers": 5,
  "jobType": "fullRender",
  "variables": {"message": "Hello from Revideo!"}
}
```

If you want to build an app that interacts with your function, you should use the AWS Lambda SDK. You can see how it is used to invoke partial renders within `src/lambda.ts`. 