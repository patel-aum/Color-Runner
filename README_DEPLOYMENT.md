# AWS S3 Deployment Instructions

This document explains how to deploy the React application to AWS S3 using the provided Python script.

## Prerequisites

1. Install Python dependencies:
```bash
pip install boto3
```

2. Configure AWS credentials:
- Install AWS CLI
- Run `aws configure` and enter your AWS credentials:
  - AWS Access Key ID
  - AWS Secret Access Key
  - Default region (recommended: us-west-2)
  - Default output format (json)

## Deployment Steps

1. Open the `deploy.py` script and modify the `bucket_name` variable in the `main()` function to your desired unique S3 bucket name.

2. Run the deployment script:
```bash
python deploy.py
```

The script will:
1. Build the React application
2. Create an S3 bucket (if it doesn't exist)
3. Configure the bucket for static website hosting
4. Upload the built files
5. Set appropriate permissions
6. Output the website URL

## Notes

- The S3 bucket name must be globally unique across all AWS accounts
- The bucket will be configured for public access to serve the website
- The deployment uses the us-west-2 (Oregon) region by default
- Make sure your AWS credentials have sufficient permissions to create and configure S3 buckets

## Troubleshooting

If you encounter any issues:
1. Check your AWS credentials are correctly configured
2. Ensure the bucket name is unique
3. Verify you have the required permissions in AWS
4. Check if the build process completed successfully