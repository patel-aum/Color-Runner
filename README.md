# Color Runner Game

A fast-paced endless runner game where you match colors to survive! Built with React, TypeScript, and Tailwind CSS.

## Game Instructions

- The player automatically moves forward
- Press SPACE to switch between colors
- Match your color with the upcoming obstacles to pass through them
- Avoid colliding with obstacles of different colors
- The game speeds up as you progress
- Try to achieve the highest score!

## AWS Deployment Guide

### Prerequisites

1. AWS Account with appropriate permissions
2. AWS CLI installed and configured
3. Node.js and npm installed

### AWS Services Used

1. **Amazon S3**
   - Used for hosting static website files
   - Provides global content delivery
   - Cost-effective storage solution

2. **Amazon CloudFront**
   - CDN for fast content delivery
   - HTTPS support
   - Edge caching

### Deployment Steps

1. **S3 Setup**
   ```bash
   - Just run the deploy.sh script it will configure bucket, just change the name of the bucket and you are good to go.
   ```

4. **CloudFront Setup**
   - Create distribution pointing to S3 bucket
   - Configure SSL certificate
   - Set up custom domain (optional)

### Security Considerations

- Enable AWS WAF for security
- Use IAM roles and policies
- Regular security patches
- Enable CloudWatch monitoring
- Implement backup strategy

### Cost Optimization

- Use S3 lifecycle policies
- Choose appropriate EC2 instance type
- Monitor CloudFront usage
- Set up billing alerts
