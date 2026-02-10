# Cloud PostgreSQL Database Setup

## Overview

This document outlines the configuration and management of the managed PostgreSQL database for the TrustTrip application. The database is provisioned on **AWS RDS** (or Azure Database for PostgreSQL) and provides a production-grade data layer with automated backups, high availability, and secure network access.

---

## Provider Selection & Configuration

### Option 1: AWS RDS (Recommended for this project)

**Configuration Summary:**

| Parameter | Value | Notes |
|-----------|-------|-------|
| **Provider** | AWS RDS | Free-tier eligible |
| **Engine** | PostgreSQL | Latest compatible version |
| **Instance Type** | db.t3.micro | Free-tier eligible |
| **Storage** | 20 GB gp2 | SSD storage |
| **Region** | ap-south-1 (Mumbai) | Choose your nearest region |
| **VPC** | Default VPC | Auto-assigned subnet |
| **Security Group** | sg-xxxxx | PostgreSQL (TCP 5432) |

**Key Parameters:**
- **DB Instance Identifier:** `trusttrip-db`
- **Master Username:** `admin`
- **Master Password:** [Your secure password]
- **Endpoint:** `trusttrip-db.xxxxxx.ap-south-1.rds.amazonaws.com`
- **Port:** `5432`
- **Database Name:** `trusttrip_db`

### Option 2: Azure Database for PostgreSQL

**Configuration Summary:**

| Parameter | Value | Notes |
|-----------|-------|-------|
| **Provider** | Azure Database | Flexible server |
| **Compute Tier** | Burstable B1s | Free-tier eligible |
| **Storage** | 32 GB | Included |
| **Region** | East US / West Europe | Choose your nearest region |
| **Server Name** | `trusttrip-postgres` | Unique globally |
| **Admin Username** | `trusttrip_admin` | Custom username |

---

## Connection Instructions

### 1. Environment Variables

Create a `.env.production` file in the project root:

```bash
# Cloud PostgreSQL Database
DATABASE_URL="postgresql://admin:YourSecurePassword@trusttrip-db.xxxxxx.ap-south-1.rds.amazonaws.com:5432/trusttrip_db"

# Optional: Direct connection for migrations
PGHOST="trusttrip-db.xxxxxx.ap-south-1.rds.amazonaws.com"
PGDATABASE="trusttrip_db"
PGUSER="admin"
PGPASSWORD="YourSecurePassword"
PGPORT="5432"

# Application Environment
NODE_ENV="production"
```

**Important Security Notes:**
- Never commit `.env.production` to version control
- Use strong passwords (minimum 16 characters)
- Rotate credentials periodically in production

### 2. Connection String Format

The DATABASE_URL follows this format:

```
postgresql://[username]:[password]@[endpoint]:[port]/[database]
```

**Example:**
```
postgresql://admin:P%40ssw0rd123@trusttrip-db.cgxk8e4d2e1e.ap-south-1.rds.amazonaws.com:5432/trusttrip_db
```

**URL Encoding:**
- Special characters in password must be URL-encoded
- `@` → `%40`
- `#` → `%23`
- `$` → `%24`
- `%` → `%25`

### 3. Testing Connection

**From Next.js Application:**
```bash
# Deploy and test the connection
curl https://your-production-domain.com/api/test

# Expected Response:
{
  "success": true,
  "message": "Database connection successful!",
  "data": {
    "usersCount": 5,
    "projectsCount": 12,
    "timestamp": "2024-01-30T10:00:00.000Z"
  }
}
```

**From Command Line (psql):**
```bash
# Install psql client
# macOS: brew install postgresql
# Ubuntu: sudo apt-get install postgresql-client

# Connect to database
psql "host=trusttrip-db.xxxxxx.ap-south-1.rds.amazonaws.com port=5432 dbname=trusttrip_db user=admin password=YourPassword sslmode=require"

# Test query
SELECT NOW();
SELECT COUNT(*) FROM "User";
```

---

## Security Setup

### Network Access Control

#### AWS RDS Security Group Configuration

**Step 1: Navigate to Security Groups**
1. Go to AWS Console → EC2 → Security Groups
2. Find the security group associated with your RDS instance

**Step 2: Configure Inbound Rules**

| Type | Protocol | Port Range | Source | Description |
|------|----------|------------|--------|-------------|
| PostgreSQL | TCP | 5432 | Your IP/32 | Development access |
| PostgreSQL | TCP | 5432 | Application VPC CIDR | Production app access |

**Step 3: Best Practices**
- ✅ Restrict source IP to known IPs only
- ✅ Use VPC endpoints for AWS-internal traffic
- ✅ Enable SSL/TLS for all connections
- ✅ Use IAM authentication for enhanced security
- ✅ Regularly audit security group rules

#### Azure Firewall Rules

**Step 1: Navigate to Networking**
1. Go to Azure Portal → Azure Database for PostgreSQL
2. Select your server → Networking

**Step 2: Add Firewall Rules**

| Rule Name | Start IP | End IP | Purpose |
|-----------|----------|--------|---------|
| TrustTrip-Dev | Your IP | Your IP | Development access |
| TrustTrip-App | App Service IP | App Service IP | Production access |

**Step 3: Enable SSL**
- SSL enforcement: Enabled (Required)
- SSL version: TLS 1.2 minimum

### Connection Security

**SSL/TLS Configuration:**

All connections require SSL encryption. The Prisma client automatically handles SSL certificates for AWS RDS and Azure.

**Certificate Download (Optional for enhanced security):**
```bash
# Download AWS RDS certificate
curl -o rds-ca-2019-root.pem https://s3.amazonaws.com/rds-downloads/rds-ca-2019-root.pem

# Configure connection with certificate
DATABASE_URL="postgresql://admin:password@host:5432/db?sslmode=verify-full&sslrootcert=rds-ca-2019-root.pem"
```

---

## Backup & Recovery

### Automated Backups

#### AWS RDS Backup Configuration

**Backup Settings:**
- **Backup Window:** 00:00-02:00 UTC (adjust to off-peak hours)
- **Retention Period:** 7 days (minimum) → **Recommended: 35 days**
- **Backup Replication:** Disabled (enable for production)

**Backup Process:**
1. Automated daily backups during backup window
2. Transaction logs archived every 5 minutes
3. Point-in-time recovery (PITR) enabled by default
4. Backups stored in S3 (multi-AZ redundancy)

**Restoring from Backup:**
```bash
# AWS Console:
# 1. Go to RDS → Databases
# 2. Select source instance → Actions → Restore to point in time
# 3. Specify target instance name and restoration time
# 4. Wait for new instance to be available
```

#### Azure Backup Configuration

**Backup Settings:**
- **Retention Period:** 7 days (minimum) → **Recommended: 30 days**
- **Backup Window:** Configured automatically
- **Geo-redundant backup:** Enabled

**Restoring from Backup:**
```bash
# Azure CLI:
az postgres flexible-server restore \
  --name trusttrip-db-restored \
  --source-name trusttrip-db \
  --restore-time "2024-01-30T10:00:00Z"
```

### Manual Snapshots

**AWS RDS Snapshots:**
```bash
# Create manual snapshot
aws rds create-db-snapshot \
  --db-instance-identifier trusttrip-db \
  --db-snapshot-identifier trusttrip-manual-backup-$(date +%Y%m%d)

# List snapshots
aws rds describe-db-snapshots \
  --db-instance-identifier trusttrip-db
```

**Best Practices:**
- Create snapshots before major deployments
- Test restoration procedures quarterly
- Store critical snapshots cross-region

---

## Scaling & Performance

### Vertical Scaling

#### AWS RDS Scaling Options

| Instance Type | vCPU | Memory | Use Case |
|---------------|------|--------|----------|
| db.t3.micro | 2 | 1 GiB | Development, low traffic |
| db.t3.small | 2 | 2 GiB | Small production |
| db.t3.medium | 2 | 4 GiB | Medium production |
| db.m5.large | 2 | 8 GiB | High traffic |

**Scaling Command:**
```bash
aws rds modify-db-instance \
  --db-instance-identifier trusttrip-db \
  --db-instance-class db.t3.medium \
  --apply-immediately
```

#### Azure Scaling Options

| Compute Tier | vCPU | Memory | Use Case |
|--------------|------|--------|----------|
| B1s | 1 | 1 GiB | Development |
| B2s | 2 | 4 GiB | Small production |
| B4ms | 4 | 16 GiB | Medium production |

**Scaling Command:**
```bash
az postgres flexible-server update \
  --name trusttrip-db \
  --sku-name B2s
```

### Horizontal Scaling (Read Replicas)

#### AWS Read Replicas

**Benefits:**
- Offload read traffic from primary instance
- Improve read scalability
- Provide disaster recovery
- Enable cross-region deployment

**Create Read Replica:**
```bash
aws rds create-db-instance-read-replica \
  --db-instance-identifier trusttrip-db-replica \
  --source-db-instance-identifier trusttrip-db \
  --db-instance-class db.t3.micro
```

**Connection String for Replica:**
```
postgresql://admin:password@trusttrip-db-replica.xxxxxx.ap-south-1.rds.amazonaws.com:5432/trusttrip_db
```

#### Azure Read Replicas

**Create Replica:**
```bash
az postgres flexible-server replica create \
  --name trusttrip-db-replica \
  --source-server trusttrip-db
```

### Performance Optimization

**Indexing Strategy:**
```sql
-- Review and optimize indexes
SELECT
  schemaname,
  relname,
  seq_scan,
  seq_tup_read,
  idx_scan,
  idx_tup_fetch
FROM pg_stat_user_tables
ORDER BY seq_scan DESC;
```

**Connection Pooling (Recommended for high traffic):**
- Use **PgBouncer** or **AWS RDS Proxy**
- Reduces connection overhead
- Manages connection limits
- Improves performance under load

---

## Cost Management

### Cost Breakdown (AWS RDS Free-Tier)

| Resource | Free Allocation | Cost After Free Tier |
|----------|-----------------|---------------------|
| db.t3.micro instance | 750 hours/month | ~$15/month |
| Storage (gp2) | 20 GB | ~$2.40/month |
| Automated backups | Storage included | ~$1-2/month |
| Data transfer | 1 GB/month | Variable |

### Cost Breakdown (Azure Database)

| Resource | Free Allocation | Cost After Free Tier |
|----------|-----------------|---------------------|
| B1s instance | 750 hours/month | ~$9/month |
| Storage | 32 GB | ~$1.50/month |
| Backups | Storage included | ~$1/month |

### Cost Optimization Strategies

1. **Right-size Your Instance**
   - Start small, scale as needed
   - Monitor actual utilization
   - Use auto-scaling in production

2. **Reserved Instances (For Production)**
   - 1-year commitment: ~40% savings
   - 3-year commitment: ~60% savings

3. **Auto-Scaling**
   - Set maximum instance size
   - Configure scaling policies based on CPU/memory

4. **Monitor and Alert**
   - Set up AWS Cost Explorer alerts
   - Monitor unused resources
   - Review monthly bills carefully

---

## Screenshots

### Screenshot 1: AWS RDS Instance Created
*(Place screenshot here showing RDS dashboard with trusttrip-db instance)*

### Screenshot 2: Security Group Configuration
*(Place screenshot here showing inbound rules for PostgreSQL)*

### Screenshot 3: Connection Test from Next.js
*(Place screenshot here showing API response with successful connection)*

### Screenshot 4: pgAdmin Connected to Cloud Database
*(Place screenshot here showing pgAdmin connected and query results)*

### Screenshot 5: Automated Backups Configuration
*(Place screenshot here showing backup settings in AWS/Azure console)*

### Screenshot 6: Cost Estimation
*(Place screenshot here showing monthly cost calculator)*

---

## Reflection

### Backup Strategy

**Current Configuration:**
- Automated backups with 7-day retention (extendable to 35 days)
- Point-in-time recovery capability
- Daily automated backups during maintenance window

**Improvements for Production:**
- Enable cross-region backup replication for disaster recovery
- Implement weekly manual snapshots before major changes
- Test quarterly restoration procedures
- Consider longer retention (35-90 days) for compliance

### Read Replica Benefits

**Performance Benefits:**
- Offloads read queries from primary instance
- Scales read capacity independently
- Reduces latency for geographically distributed users

**Reliability Benefits:**
- Provides disaster recovery capability
- Enables zero-downtime migrations
- Supports blue-green deployments

**Implementation Plan:**
1. Deploy read replica in same region (low latency)
2. Configure application to use replica for read operations
3. Monitor replica lag and adjust as needed
4. Consider cross-region replica for high availability

### Cost Awareness

**Current Cost (Free-Tier):**
- **Estimated Monthly Cost (Free-Tier):** $0
- **After Free-Tier:** $18-25/month (conservative estimate)

**Cost Reduction Strategies:**
1. Use auto-scaling to match demand
2. Implement connection pooling to reduce instance size needs
3. Consider reserved instances for predictable workloads
4. Monitor and alert on unexpected usage spikes

**Budget Planning:**
- Development/Testing: $0-15/month
- Production (Small): $25-50/month
- Production (Medium): $50-100/month
- Production (Large): $100+/month

### Security Considerations

**Network Security:**
- ✅ IP allowlisting implemented
- ✅ SSL/TLS enforced
- ✅ Security group audits scheduled

**Data Security:**
- Encryption at rest (enabled by default)
- Encryption in transit (SSL required)
- Regular security patch updates (automatic)

**Access Control:**
- Principle of least privilege
- Separate credentials for different environments
- Audit logging enabled

---

## Troubleshooting

### Connection Issues

**Error: `Connection refused`**
- Verify security group allows your IP
- Check instance is in "Available" status
- Confirm correct endpoint and port

**Error: `Timeout expired`**
- Check network connectivity
- Verify firewall rules
- Confirm instance is publicly accessible or VPN configured

**Error: `Invalid username/password`**
- Verify credentials in connection string
- Check for special character encoding
- Confirm user has database access

### Performance Issues

**Slow Queries:**
```sql
-- Identify slow queries
SELECT query, mean_time, calls
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

**High CPU Usage:**
- Check for unoptimized queries
- Review index usage
- Consider scaling instance size

---

## References

### AWS RDS Documentation
- [RDS PostgreSQL Getting Started](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_GettingStarted.html)
- [RDS Best Practices](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_BestPractices.html)
- [RDS Pricing](https://aws.amazon.com/rds/postgresql/pricing/)

### Azure Database Documentation
- [Azure PostgreSQL Getting Started](https://docs.microsoft.com/azure/postgresql/flexible-server/quickstart-create-server-portal)
- [Azure PostgreSQL Concepts](https://docs.microsoft.com/azure/postgresql/flexible-server/concepts)
- [Azure Pricing](https://azure.microsoft.com/pricing/details/postgresql/)

### Prisma Documentation
- [Prisma PostgreSQL Setup](https://www.prisma.io/docs/getting-started/setup-prisma/add-to-existing-project/postgresql)
- [Prisma Migrate](https://www.prisma.io/docs/reference/api-reference/command-reference#migrate)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)

---

## Next Steps

1. **Immediate Actions:**
   - [ ] Provision cloud PostgreSQL instance
   - [ ] Configure security group/firewall rules
   - [ ] Test connection from local environment
   - [ ] Run database migrations

2. **Short-Term:**
   - [ ] Deploy to production environment
   - [ ] Configure monitoring and alerts
   - [ ] Document recovery procedures

3. **Long-Term:**
   - [ ] Implement read replicas
   - [ ] Set up connection pooling
   - [ ] Review and optimize costs quarterly
   - [ ] Implement advanced security measures (IAM auth, VPC endpoints)

