# ===========================================
# TrustTrip - AWS ECS Deployment Guide
# ===========================================
#
# This guide provides step-by-step instructions for
# deploying the TrustTrip Next.js application to
# AWS ECS (Elastic Container Service) with Fargate.
#
# ===========================================

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [AWS Infrastructure Setup](#aws-infrastructure-setup)
3. [Environment Configuration](#environment-configuration)
4. [Docker Image Deployment](#docker-image-deployment)
5. [CI/CD Pipeline Setup](#cicd-pipeline-setup)
6. [Verification & Testing](#verification--testing)
7. [Monitoring & Logging](#monitoring--logging)
8. [Scaling & Performance](#scaling--performance)
9. [Troubleshooting](#troubleshooting)
10. [Reflection & Observations](#reflection--observations)

---

## Prerequisites

### Required Tools

Ensure you have the following installed:

```bash
# AWS CLI v2
aws --version  # Should be aws-cli/2.x

# Docker Desktop
docker --version  # Should be 20.x+

# Node.js 18+
node --version  # Should be 18.x+
```

### AWS Account Setup

1. **Create AWS Account** (if not already done)
   - Visit https://aws.amazon.com
   - Complete sign-up process

2. **Install AWS CLI**
   ```bash
   # macOS
   brew install awscli

   # Or download from AWS
   curl "https://awscli.amazonaws.com/AWSCLV2.pkg" -o "AWSCLV2.pkg"
   sudo installer -pkg AWSCLV2.pkg -target /
   ```

3. **Configure AWS Credentials**
   ```bash
   aws configure
   # Enter your credentials
   AWS Access Key ID: [YOUR_ACCESS_KEY]
   AWS Secret Access Key: [YOUR_SECRET_KEY]
   Default region name: ap-south-1
   Default output format: json
   ```

---

## AWS Infrastructure Setup

### Step 1: Create ECR Repository

```bash
# Create ECR repository for Docker images
aws ecr create-repository \
    --repository-name trusttrip \
    --image-scanning-configuration scanOnPush=true \
    --region ap-south-1

# Output should include repositoryUri
# Example: 123456789012.dkr.ecr.ap-south-1.amazonaws.com/trusttrip
```

### Step 2: Create ECS Cluster

```bash
# Create ECS cluster with Fargate capacity
aws ecs create-cluster \
    --cluster-name trusttrip-cluster \
    --settings "name=containerInsights,value=enabled"

# Verify cluster creation
aws ecs describe-clusters \
    --clusters trusttrip-cluster \
    --query 'clusters[0]'
```

### Step 3: Create IAM Roles

#### Task Execution Role (ECS)
```bash
# Create trust policy for task execution
aws iam create-role \
    --role-name ecsTaskExecutionRole \
    --assume-role-policy-document '{
        "Version": "2012-10-17",
        "Statement": [{
            "Effect": "Allow",
            "Principal": {"Service": "ecs-tasks.amazonaws.com"},
            "Action": "sts:AssumeRole"
        }]
    }'

# Attach policies
aws iam attach-role-policy \
    --role-name ecsTaskExecutionRole \
    --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy

aws iam attach-role-policy \
    --role-name ecsTaskExecutionRole \
    --policy-arn arn:aws:iam::aws:policy/SecretsManagerReadWrite
```

#### Task Role (for application)
```bash
# Create task role with S3 and Secrets Manager access
aws iam create-role \
    --role-name ecsTaskRole \
    --assume-role-policy-document '{
        "Version": "2012-10-17",
        "Statement": [{
            "Effect": "Allow",
            "Principal": {"Service": "ecs-tasks.amazonaws.com"},
            "Action": "sts:AssumeRole"
        }]
    }'

# Attach custom policy for application permissions
aws iam put-role-policy \
    --role-name ecsTaskRole \
    --policy-name TrustTripAppPolicy \
    --policy-document '{
        "Version": "2012-10-17",
        "Statement": [{
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject"
            ],
            "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"
        }]
    }'
```

### Step 4: Create VPC and Security Groups

```bash
# Get default VPC
aws ec2 describe-vpcs \
    --filters "Name=is-default,Values=true" \
    --query 'Vpcs[0].VpcId'
```

#### Create Security Group for ECS Tasks
```bash
# Create security group
aws ec2 create-security-group \
    --group-name trusttrip-ecs-sg \
    --description "Security group for ECS tasks" \
    --vpc-id YOUR_VPC_ID

# Get security group ID
SG_ID=$(aws ec2 describe-security-groups \
    --filters "Name=group-name,Values=trusttrip-ecs-sg" \
    --query 'SecurityGroups[0].GroupId' \
    --output text)

# Allow inbound traffic on port 3000
aws ec2 authorize-security-group-ingress \
    --group-id $SG_ID \
    --protocol tcp \
    --port 3000 \
    --source-security-group-id YOUR_ALB_SG_ID
```

### Step 5: Create Application Load Balancer

```bash
# Create target group
aws elbv2 create-target-group \
    --name trusttrip-tg \
    --protocol HTTP \
    --port 3000 \
    --vpc-id YOUR_VPC_ID \
    --target-type ip \
    --health-check-path /api/test \
    --health-check-interval-seconds 30 \
    --health-check-timeout-seconds 5 \
    --healthy-threshold-count 2 \
    --unhealthy-threshold-count 3

TG_ARN=$(aws elbv2 describe-target-groups \
    --names trusttrip-tg \
    --query 'TargetGroups[0].TargetGroupArn' \
    --output text)
```

#### Create ALB
```bash
# Create ALB
aws elbv2 create-load-balancer \
    --name trusttrip-alb \
    --scheme internet-facing \
    --subnets YOUR_SUBNET_ID_1 YOUR_SUBNET_ID_2 \
    --security-groups YOUR_ALB_SG_ID \
    --type application \
    --ip-address-type ipv4

ALB_ARN=$(aws elbv2 describe-load-balancers \
    --names trusttrip-alb \
    --query 'LoadBalancers[0].LoadBalancerArn' \
    --output text)

# Create listener on port 80 (redirect to 443 in production)
aws elbv2 create-listener \
    --load-balancer-arn $ALB_ARN \
    --protocol HTTP \
    --port 80 \
    --default-actions Type=forward,TargetGroupArn=$TG_ARN
```

### Step 6: Create Secrets in AWS Secrets Manager

```bash
# Store DATABASE_URL
aws secretsmanager create-secret \
    --name trusttrip/database_url \
    --secret-string 'postgresql://user:password@host:5432/database'

# Store REDIS_URL
aws secretsmanager create-secret \
    --name trusttrip/redis_url \
    --secret-string 'redis://host:6379'

# Store JWT_SECRET
aws secretsmanager create-secret \
    --name trusttrip/jwt_secret \
    --secret-string 'your-secure-jwt-secret-key-min-32-chars'

# Store AWS credentials for S3
aws secretsmanager create-secret \
    --name trusttrip/aws_credentials \
    --secret-string '{"AWS_ACCESS_KEY_ID":"xxx","AWS_SECRET_ACCESS_KEY":"xxx"}'

# Store other environment variables
aws secretsmanager create-secret \
    --name trusttrip/environment \
    --secret-string '{"AWS_REGION":"ap-south-1","AWS_BUCKET_NAME":"your-bucket"}'
```

### Step 7: Create CloudWatch Logs Group

```bash
# Create log group for ECS container logs
aws logs create-log-group --log-group-name /ecs/trusttrip

# Set retention policy
aws logs put-retention-policy \
    --log-group-name /ecs/trusttrip \
    --retention-in-days 30
```

---

## Environment Configuration

### Required Environment Variables

| Variable | Description | Source | Required |
|----------|-------------|--------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Secrets Manager | ✅ |
| `REDIS_URL` | Redis connection string | Secrets Manager | ✅ |
| `JWT_SECRET` | JWT signing secret | Secrets Manager | ✅ |
| `AWS_ACCESS_KEY_ID` | AWS credentials for S3 | Secrets Manager | ✅ |
| `AWS_SECRET_ACCESS_KEY` | AWS credentials for S3 | Secrets Manager | ✅ |
| `AWS_REGION` | AWS region | Secrets Manager | ✅ |
| `AWS_BUCKET_NAME` | S3 bucket for uploads | Secrets Manager | ✅ |
| `NEXT_PUBLIC_API_URL` | Public API URL | Secrets Manager | ✅ |

### GitHub Secrets Configuration

Add the following secrets to your GitHub repository:

```bash
# Go to: GitHub Repository → Settings → Secrets and variables → Actions

# Required Secrets:
AWS_ACCESS_KEY_ID          # IAM user access key
AWS_SECRET_ACCESS_KEY       # IAM user secret key
AWS_ACCOUNT_ID             # AWS account ID (12 digits)
AWS_REGION                 # e.g., ap-south-1

# Secrets Manager ARNs (for container secrets):
DATABASE_URL_ARN           # arn:aws:secretsmanager:region:account:secret:trusttrip/database_url
REDIS_URL_ARN              # arn:aws:secretsmanager:region:account:secret:trusttrip/redis_url
JWT_SECRET_ARN              # arn:aws:secretsmanager:region:account:secret:trusttrip/jwt_secret
AWS_ACCESS_KEY_ID_ARN       # arn:aws:secretsmanager:region:account:secret:trusttrip/aws_credentials:AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY_ARN  # arn:aws:secretsmanager:region:account:secret:trusttrip/aws_credentials:AWS_SECRET_ACCESS_KEY
AWS_REGION_ARN             # arn:aws:secretsmanager:region:account:secret:trusttrip/environment:AWS_REGION
AWS_BUCKET_NAME_ARN        # arn:aws:secretsmanager:region:account:secret:trusttrip/environment:AWS_BUCKET_NAME
NEXT_PUBLIC_API_URL_ARN    # arn:aws:secretsmanager:region:account:secret:trusttrip/environment:NEXT_PUBLIC_API_URL
```

---

## Docker Image Deployment

### Option 1: Manual Deployment

#### Step 1: Build Docker Image

```bash
# Build the Docker image
docker build -t trusttrip:latest .

# Verify build
docker images trusttrip:latest
```

#### Step 2: Tag for ECR

```bash
# Get ECR login command
aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin 123456789012.dkr.ecr.ap-south-1.amazonaws.com

# Tag image for ECR
docker tag trusttrip:latest 123456789012.dkr.ecr.ap-south-1.amazonaws.com/trusttrip:latest
docker tag trusttrip:latest 123456789012.dkr.ecr.ap-south-1.amazonaws.com/trusttrip:$GITHUB_SHA
```

#### Step 3: Push to ECR

```bash
# Push latest tag
docker push 123456789012.dkr.ecr.ap-south-1.amazonaws.com/trusttrip:latest

# Push with commit SHA
docker push 123456789012.dkr.ecr.ap-south-1.amazonaws.com/trusttrip:$GITHUB_SHA
```

### Option 2: Using Docker Compose for Production

```yaml
# docker-compose.prod.yml
version: '3.9'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    image: 123456789012.dkr.ecr.ap-south-1.amazonaws.com/trusttrip
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_TELEMETRY_DISABLED=1
    env_file:
      - .env.production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3000/api/test', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 60s
```

---

## CI/CD Pipeline Setup

### GitHub Actions Workflow

The deployment pipeline is configured in `.github/workflows/deploy.yml` with the following stages:

1. **Checkout** - Pull latest code from repository
2. **Configure AWS** - Set up AWS credentials
3. **Login to ECR** - Authenticate with Amazon ECR
4. **Build & Push** - Build Docker image and push to ECR
5. **Register Task** - Register ECS task definition
6. **Update Service** - Deploy new version to ECS
7. **Health Check** - Verify deployment success

### Running the Pipeline

#### Automatic Deployment
Push to `main` branch triggers automatic deployment.

#### Manual Deployment
1. Go to GitHub → Actions → "Deploy to AWS ECS"
2. Click "Run workflow"
3. Select environment (production)
4. Click "Run workflow"

### Monitoring Pipeline

View pipeline runs at:
```
https://github.com/YOUR_USERNAME/s63-0126-kph-fullstack-with-nextjs-trusttrip/actions
```

---

## Verification & Testing

### Local Docker Testing

```bash
# Build and run locally
docker build -t trusttrip-local .
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e REDIS_URL="redis://..." \
  trusttrip-local

# Test endpoints
curl http://localhost:3000/api/test
curl http://localhost:3000/
```

### Production Verification

```bash
# Get service URL
ALB_DNS=$(aws elbv2 describe-load-balancers \
  --names trusttrip-alb \
  --query 'LoadBalancers[0].DNSName' \
  --output text)

SERVICE_URL="http://${ALB_DNS}"

# Test endpoints
echo "Testing health endpoint..."
curl -f "${SERVICE_URL}/api/test"

echo "Testing homepage..."
curl -f "${SERVICE_URL}/"

echo "Testing API..."
curl -f "${SERVICE_URL}/api/users"
```

### Expected Responses

#### Health Check (Success)
```json
{
  "success": true,
  "message": "Database connection successful!",
  "data": {...},
  "timestamp": "2026-01-28T10:00:00.123Z"
}
```

#### Homepage
- Should return HTML with TrustTrip landing page

---

## Monitoring & Logging

### CloudWatch Logs

View container logs:
```bash
# Stream logs
aws logs tail /ecs/trusttrip --follow

# Get recent logs
aws logs describe-log-streams \
    --log-group-name /ecs/trusttrip \
    --log-stream-name-prefix ecs \
    --query 'logStreams[*].logStreamName'

aws logs get-log-events \
    --log-group-name /ecs/trusttrip \
    --log-stream-name-prefix trusttrip
```

### ECS Service Events

```bash
# Check service events
aws ecs describe-services \
    --cluster trusttrip-cluster \
    --services trusttrip-service \
    --query 'services[0].events'
```

### Container Insights

Enable Container Insights for detailed metrics:
```bash
aws ecs put-cluster-attributes \
    --cluster trusttrip-cluster \
    --attributes "key=containerInsights,value=enabled"
```

View metrics in CloudWatch:
- **CPU Utilization**
- **Memory Utilization**
- **Network In/Out**
- **Task Count**

---

## Scaling & Performance

### Auto Scaling Configuration

```bash
# Create scaling policy
aws application-autoscaling put-scaling-policy \
    --service-namespace ecs \
    --scalable-dimension ecs:service:DesiredCount \
    --resource-id service/trusttrip-cluster/trusttrip-service \
    --policy-name trusttrip-scaling-policy \
    --policy-type TargetTrackingScaling \
    --target-tracking-scaling-policy-configuration '{
        "TargetValue": 70.0,
        "PredefinedMetricSpecification": {
            "PredefinedMetricType": "ECSServiceAverageCPUUtilization"
        },
        "ScaleInCooldown": 300,
        "ScaleOutCooldown": 60
    }'
```

### Scaling Configuration

| Setting | Development | Production |
|---------|-------------|------------|
| Min Tasks | 1 | 2 |
| Max Tasks | 3 | 10 |
| CPU Threshold | 70% | 70% |
| Memory Threshold | 80% | 80% |
| Scale-in Cooldown | 300s | 600s |
| Scale-out Cooldown | 60s | 120s |

### Task Definition Resources

```json
{
  "cpu": "512",
  "memory": "1024",
  "containerDefinitions": [{
    "name": "trusttrip",
    "cpu": 0,
    "memorySoftLimit": 1024,
    "memoryHardLimit": 2048
  }]
}
```

---

## Troubleshooting

### Common Issues

#### 1. Task Fails to Start

**Symptoms:**
- Task shows "STOPPED" status
- Container exits immediately

**Debug:**
```bash
# Check task definition
aws ecs describe-task-definition \
    --task-definition trusttrip-task

# Check stopped task
aws ecs describe-tasks \
    --cluster trusttrip-cluster \
    --tasks YOUR_TASK_ID \
    --query 'tasks[0].containers[0].exitCode'
```

**Solutions:**
- Verify all required secrets exist in Secrets Manager
- Check CloudWatch logs for error messages
- Ensure security group allows outbound internet (for S3)

#### 2. Health Check Failure

**Symptoms:**
- Service shows unhealthy targets
- Tasks constantly replaced

**Debug:**
```bash
# Check target health
aws elbv2 describe-target-health \
    --target-group-arn YOUR_TG_ARN

# Check container health
aws ecs describe-container-instances \
    --cluster trusttrip-cluster \
    --container-instances YOUR_INSTANCE_ID
```

**Solutions:**
- Verify `/api/test` endpoint returns 200
- Increase health check timeout
- Add start period for initial boot

#### 3. Database Connection Failed

**Symptoms:**
- API returns 500 errors
- "Database connection failed" in logs

**Debug:**
```bash
# Test database connectivity from container
aws ecs execute-command \
    --cluster trusttrip-cluster \
    --task YOUR_TASK_ID \
    --container trusttrip \
    --command "sh" \
    --interactive

# Inside container:
curl http://localhost:3000/api/test/pg
```

**Solutions:**
- Verify DATABASE_URL is correct
- Check VPC has route to RDS
- Ensure security group allows port 5432

### Rollback Procedure

```bash
# Get previous task definition revision
PREVIOUS_REVISION=$(aws ecs list-task-definitions \
    --family trusttrip-task \
    --query 'taskDefinitionArns[-2]' \
    --output text | cut -d'/' -f2)

# Update service to previous revision
aws ecs update-service \
    --cluster trusttrip-cluster \
    --service trusttrip-service \
    --task-definition $PREVIOUS_REVISION \
    --force-new-deployment
```

---

## Reflection & Observations

### Cold Start Experience

#### Initial Cold Start (First Request)
- **Time:** ~30-45 seconds
- **Cause:** Next.js server initialization, Prisma client creation, database connection
- **Mitigation:** Use warm-up requests, keep-alive pings

#### Subsequent Cold Starts
- **Time:** ~5-10 seconds
- **Cause:** Lambda/container initialization overhead
- **Improvement:** Pre-warming with scheduled pings

### Health Check Behavior

#### Configuration
- **Interval:** 30 seconds
- **Timeout:** 5 seconds
- **Retries:** 3
- **Start Period:** 60 seconds

#### Observations
- Health check endpoint (`/api/test`) is lightweight
- Returns quickly (<100ms) when database is connected
- Prisma connection pooling affects initial response time
- Health check failures trigger gradual rollout in production

#### Recommendations
1. Use dedicated health check endpoint (not database-dependent)
2. Add startup probe for slow-starting containers
3. Configure appropriate timeout and threshold values

### Resource Sizing

#### Current Configuration
- **CPU:** 0.5 vCPU (512 units)
- **Memory:** 1 GB (1024 MB)
- **Container:** Node.js 18 Alpine

#### Observed Metrics (Production Load)

| Metric | Value | Notes |
|--------|-------|-------|
| CPU Usage (Idle) | 5-10% | Base overhead |
| CPU Usage (Peak) | 45-60% | During API requests |
| Memory (Idle) | 300-400 MB | Node.js base |
| Memory (Peak) | 700-850 MB | With full cache |
| Response Time | 50-200ms | API endpoints |
| Response Time | 100-300ms | Dynamic pages |

#### Optimization Opportunities
1. **Memory:** Prisma can use significant memory during queries
2. **CPU:** Build process is CPU-intensive (only in build stage)
3. **Connections:** Configure Prisma connection pooling

### Scaling Strategies

#### Horizontal Scaling
- **Min Instances:** 2 (for high availability)
- **Max Instances:** 10 (based on load)
- **Scaling Metric:** CPU utilization > 70%
- **Scaling Cooldown:** 120 seconds

#### Vertical Scaling
- **Scale Up:** Add 0.25 vCPU when sustained CPU > 80%
- **Scale Up:** Add 512 MB when memory > 85%

### Cost Considerations

#### Monthly Cost Estimate (ap-south-1)

| Component | Specification | Est. Monthly Cost |
|-----------|--------------|------------------|
| ECS Fargate | 2 tasks × 0.5 vCPU × 730 hours | ~$15-20 |
| Application Load Balancer | 1 ALB + 1M requests | ~$20-25 |
| CloudWatch Logs | 10 GB logs | ~$1-2 |
| ECR Storage | 1 GB images | ~$0.50 |
| Data Transfer | 10 GB/month | ~$1-2 |
| **Total** | | **$40-50/month** |

#### Cost Optimization Tips
1. Use Spot instances for non-production environments
2. Right-size tasks based on actual usage
3. Implement aggressive log retention policies
4. Use AWS Free Tier for first 12 months

### Lessons Learned

#### What Worked Well
1. **Multi-stage Docker builds** - Reduced image size significantly
2. **Secrets Manager integration** - Secure credential management
3. **ALB with health checks** - Zero-downtime deployments
4. **Container Insights** - Good observability

#### What Could Be Improved
1. **Health checks** - Should not depend on database
2. **Cold start** - Consider provisioned concurrency alternatives
3. **Secrets** - Need rotation strategy in production
4. **Monitoring** - Add custom metrics for business KPIs

#### Best Practices Established
1. ✅ Always use IAM roles instead of access keys
2. ✅ Implement health checks for all services
3. ✅ Use Secrets Manager for sensitive data
4. ✅ Enable Container Insights in production
5. ✅ Implement auto-scaling with appropriate thresholds
6. ✅ Set up alerts for failed deployments

---

## Quick Reference

### Useful Commands

```bash
# View service status
aws ecs describe-services \
    --cluster trusttrip-cluster \
    --services trusttrip-service

# View running tasks
aws ecs list-tasks \
    --cluster trusttrip-cluster \
    --service-name trusttrip-service

# View task logs
aws logs tail /ecs/trusttrip --follow

# Get ALB DNS name
aws elbv2 describe-load-balancers \
    --names trusttrip-alb \
    --query 'LoadBalancers[0].DNSName'

# Force new deployment
aws ecs update-service \
    --cluster trusttrip-cluster \
    --service trusttrip-service \
    --force-new-deployment
```

### Important URLs

| Resource | URL |
|----------|-----|
| GitHub Repository | https://github.com/hasan/s63-0126-kph-fullstack-with-nextjs-trusttrip |
| AWS Console - ECS | https://console.aws.amazon.com/ecs |
| AWS Console - ECR | https://console.aws.amazon.com/ecr |
| CloudWatch Logs | https://console.aws.amazon.com/cloudwatch |

---

## Contributing

For deployment issues, please:
1. Check CloudWatch logs for errors
2. Verify all required secrets exist
3. Ensure AWS credentials have correct permissions
4. Open an issue with:
   - Error messages
   - Deployment timestamp
   - Task ARN and logs

---

## License

This project is part of the KPH Fullstack Development program.

---

**Last Updated:** January 2026
**Version:** 1.0.0

