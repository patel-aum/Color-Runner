import boto3
import os
import mimetypes
from botocore.exceptions import ClientError

def build_project():
    """Build the React project"""
    print("Building the project...")
    os.system("npm install")  # Install dependencies
    os.system("npm run build")  # Build the project

def upload_to_s3(bucket_name, directory='dist'):
    """Upload built files to S3 bucket"""
    # Create S3 client specifically for ap-south-1
    s3_client = boto3.client('s3', region_name='ap-south-1')
    
    # Create bucket if it doesn't exist
    try:
        s3_client.create_bucket(
            Bucket=bucket_name,
            CreateBucketConfiguration={
                'LocationConstraint': 'ap-south-1'
            }
        )
        print(f"Created bucket: {bucket_name} in ap-south-1")
    except ClientError as e:
        if e.response['Error']['Code'] == 'BucketAlreadyOwnedByYou':
            print(f"Bucket {bucket_name} already exists")
        else:
            print(f"Error creating bucket: {e.response['Error']['Message']}")
            raise e

    # Enable static website hosting
    try:
        s3_client.put_bucket_website(
            Bucket=bucket_name,
            WebsiteConfiguration={
                'IndexDocument': {'Suffix': 'index.html'},
                'ErrorDocument': {'Key': 'index.html'}
            }
        )
    except ClientError as e:
        print(f"Error configuring website: {e.response['Error']['Message']}")
        raise e

    # Set bucket policy to allow public read access
    bucket_policy = {
        'Version': '2012-10-17',
        'Statement': [{
            'Sid': 'PublicReadGetObject',
            'Effect': 'Allow',
            'Principal': '*',
            'Action': 's3:GetObject',
            'Resource': f'arn:aws:s3:::{bucket_name}/*'
        }]
    }
    
    try:
        s3_client.put_bucket_policy(
            Bucket=bucket_name,
            Policy=str(bucket_policy).replace("'", '"')  # Convert single quotes to double quotes
        )
    except ClientError as e:
        print(f"Error setting bucket policy: {e.response['Error']['Message']}")
        raise e

    # Upload files
    if not os.path.exists(directory):
        raise Exception(f"Directory '{directory}' does not exist. Please build the project first.")

    for root, dirs, files in os.walk(directory):
        for file in files:
            file_path = os.path.join(root, file)
            s3_path = file_path.replace(f"{directory}/", "")
            
            # Determine content type
            content_type = mimetypes.guess_type(file_path)[0]
            if content_type is None:
                content_type = 'binary/octet-stream'

            # Upload file
            try:
                with open(file_path, 'rb') as f:
                    s3_client.put_object(
                        Bucket=bucket_name,
                        Key=s3_path,
                        Body=f,
                        ContentType=content_type
                    )
                print(f"Uploaded: {file_path}")
            except ClientError as e:
                print(f"Error uploading {file_path}: {e.response['Error']['Message']}")
                raise e

    website_url = f"http://{bucket_name}.s3-website.ap-south-1.amazonaws.com"
    return website_url

def main():
    bucket_name = "color-block"  # Replace with your desired bucket name
    
    try:
        # Build the project
        build_project()
        
        # Upload to S3 and get the URL
        website_url = upload_to_s3(bucket_name)
        print(f"\nWebsite deployed successfully!")
        print(f"Your website is available at: {website_url}")
        
    except Exception as e:
        print(f"Deployment failed: {str(e)}")
        raise

if __name__ == "__main__":
    main()

