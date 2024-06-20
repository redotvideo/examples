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

To deploy the example project to AWS Lambda, clone this repository and make sure that you have the AWS CLI and Docker installed. Then, follow these steps: 

### Create a public AWS bucket

First, create a bucket:

```
aws s3api create-bucket --bucket your-bucket-name --region your-region
```

Now apply a bucket policy that makes the bucket public and lets your user write to it:

```
aws s3api put-bucket-policy --bucket your-bucket-name --policy file://policy.json
```

Here, `policy.json` refers to a file that contains the configuration below - note that `<your-user-arn>` should be replaced with the ARN of your user:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "AddPerm",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::your-bucket-name/*"
        },
                {
            "Sid": "AllowUserToWriteObjects",
            "Effect": "Allow",
            "Principal": {
                "AWS": "<your-user-arn>"
            },
            "Action": "s3:PutObject",
            "Resource": "arn:aws:s3:::your-bucket-name/*"
        }

    ]
}
```

### Configure an IAM role for your user

You want to give the user the permission to write to buckets, invoke lambda functions and create logs in CloudWatch (in order to monitor the logs of your lambda function).

To do so, create a role with the following policy attached:

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
                "arn:aws:s3:::*"
            ]
        },
        {
            "Sid": "2",
            "Effect": "Allow",
            "Action": [
                "lambda:InvokeFunction"
            ],
            "Resource": [
                "arn:aws:lambda:*:*:function:*"
            ]
        },
        {
            "Sid": "3",
            "Effect": "Allow",
            "Action": [
                "logs:CreateLogGroup"
            ],
            "Resource": [
                "*"
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
                "*"
            ]
        }
    ]
}
```

Attach this role to the user that you have previously given the permission to write to your bucket.

### Build the docker image and push it to ECR

We want to upload our docker image to Amazon's container registry so that it is close to our lambda function. To create an ECR repository, run the following command:

```
aws ecr create-repository --repository-name my-revideo-project --region us-east-1
```

This will give you the URI of your ECR repository `<your-ecr-uri>`, which looks something like `0123456789.dkr.ecr.us-east-1.amazonaws.com/your-repo-name`.

Now you can build the docker image. To do so, head to the folder in which our `Dockerfile` is present and run:

```
docker buildx build --progress=plain --platform linux/amd64 -t my-revideo-project:latest .
```

Now tag the image to upload it to ECR:

```
docker tag my-revideo-project:latest <your-ecr-uri>:latest
```

Finally, push the image to your repository:
```
docker push <your-ecr-uri>:latest
```

### Create a Lambda function from your docker image

Finally, create a lambda function from your docker image:

```
aws lambda create-function \
    --function-name my-revideo-render-function \
    --package-type Image \
    --code ImageUri=<your-ecr-uri>:latest \
    --role <your-lambda-role-arn> \
    --timeout 600 \
    --memory-size 4096 \
    --environment Variables={REVIDEO_BUCKET_NAME=your-bucket-name}
```

You should get a response in your terminal indicating that your function is being created.

### Test your function

To test your function, head to the Lambda tab in the AWS console. Now create a test event with the following arguments and use it to invoke your function:

```
{
  "jobId": "12345",
  "numWorkers": 25,
  "jobType": "fullRender",
  "variables": {"message": "Hello from Revideo!"}
}
```

The function should run and return a url to the rendered video inside your bucket.

**Note: The first time after an image is uploaded to ECR, the function may take longer to execute. You should execute your function more than once to get a better estimate of execution times.**
