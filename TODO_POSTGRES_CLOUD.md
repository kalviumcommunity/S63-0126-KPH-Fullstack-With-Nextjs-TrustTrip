# PostgreSQL Cloud Database Provisioning - TODO

## Task Overview
Provision and configure a managed PostgreSQL database (AWS RDS or Azure Database) and connect it securely to the TrustTrip Next.js application.

## Phase 1: Provision Cloud PostgreSQL Instance ✅ (Documentation Ready)
- [x] 1.1 Choose provider (AWS RDS or Azure Database for PostgreSQL)
- [x] 1.2 Create comprehensive documentation for free-tier/basic-tier configuration
- [x] 1.3 Document key parameters to record:
  - [x] DB instance name/server name
  - [x] Engine version
  - [x] Admin username
  - [x] Region and tier
  - [x] Connection endpoint

## Phase 2: Configure Network Access ✅ (Documentation Ready)
### For AWS RDS:
- [x] 2.1 Navigate to VPC Security Groups
- [x] 2.2 Modify inbound rules documentation:
  - [x] Type: PostgreSQL (TCP 5432)
  - [x] Source: My IP address
  - [x] Description: TrustTrip Development

### For Azure:
- [x] 2.1 Navigate to Azure Database for PostgreSQL
- [x] 2.2 Access Networking settings documentation
- [x] 2.3 Add firewall rule for client IP documentation
- [x] 2.4 Enable "Allow access to Azure services" if needed

## Phase 3: Connect from Next.js Application ✅ (Configuration Ready)
- [x] 3.1 Create `.env.production.example` template
- [x] 3.2 Update connection string format documentation
- [x] 3.3 Create direct PostgreSQL connection API (`/api/test/pg`)
- [x] 3.4 Create database operations script (`scripts/db-cloud.sh`)

## Phase 4: Verify from Admin Client ✅ (Documentation Ready)
- [x] 4.1 Install pgAdmin, psql CLI, or Azure Data Studio - documentation
- [x] 4.2 Configure connection to cloud PostgreSQL - documentation
- [x] 4.3 Execute test query - documentation
- [x] 4.4 Capture screenshot of successful connection - placeholders added
- [x] 4.5 Document any connection issues and resolutions

## Phase 5: Enable Backups & Document Costs ✅ (Documentation Ready)
- [x] 5.1 Enable automated backups documentation:
  - [x] Set retention period (minimum 7 days)
  - [x] Configure backup window
  - [x] Verify backup status
- [x] 5.2 Document resource tier and specifications
- [x] 5.3 Calculate estimated monthly cost documentation
- [x] 5.4 Research and document scalability options

## Phase 6: Update Documentation ✅ (Completed)
- [x] 6.1 Create comprehensive README_POSTGRES_CLOUD.md with:
  - [x] Provider details and configuration summary
  - [x] Connection instructions and .env sample
  - [x] Security setup (IP allowlisting details)
  - [x] Placeholders for screenshots
  - [x] Reflection on:
    - [x] Backup strategy and retention
    - [x] Read replica benefits
    - [x] Cost awareness and optimization
    - [x] Security best practices
- [x] 6.2 Update main README.md with cloud database section
- [x] 6.3 Create .env.production.example template

## Phase 7: Video Demonstration 📋 (Action Required)
- [ ] 7.1 Record 1-2 minute video showing:
  - [ ] Cloud console navigation
  - [ ] Instance provisioning steps
  - [ ] Network security configuration
  - [ ] Connection verification from app
  - [ ] External admin client connection
  - [ ] Query execution demonstration
- [ ] 7.2 Provide brief explanation of:
  - [ ] Security considerations
  - [ ] Backup strategy
  - [ ] Scalability approach
- [ ] 7.3 Upload video to Google Drive or similar
- [ ] 7.4 Make video publicly accessible

## Submission Requirements
- [ ] GitHub PR URL with all changes
- [ ] Video explanation URL (clearly visible in video)
- [ ] All deliverables completed in TODO list

## Files Created/Modified

### New Files:
1. **README_POSTGRES_CLOUD.md** - Comprehensive cloud database documentation
2. **.env.production.example** - Production environment template
3. **scripts/db-cloud.sh** - Database operations helper script
4. **app/api/test/pg/route.ts** - Direct PostgreSQL connection test API
5. **TODO_POSTGRES_CLOUD.md** - Task tracking document

### Modified Files:
1. **README.md** - Added Cloud PostgreSQL Database Setup section
2. **package.json** - Added `pg` and `@types/pg` dependencies

## Next Steps for Completion

### Immediate Actions Required:
1. ⏳ Provision AWS RDS or Azure Database for PostgreSQL instance
2. ⏳ Configure security group/firewall rules for your IP
3. ⏳ Test connection from local environment
4. ⏳ Run database migrations: `npx prisma migrate deploy`
5. ⏳ Capture screenshots of:
   - RDS/Azure console with instance running
   - Security group/firewall configuration
   - API response from `/api/test`
   - Direct PostgreSQL connection from pgAdmin/psql
   - Backup configuration settings

### Documentation Updates Needed After Provisioning:
- [ ] Update README_POSTGRES_CLOUD.md with actual instance details
- [ ] Replace screenshot placeholders with actual screenshots
- [ ] Document actual cost estimation based on chosen tier
- [ ] Record and add video URL

## Notes
- Use free-tier eligible options to avoid costs during learning
- Document all steps with screenshots for reference
- Test both application connection and admin client connection
- Ensure no sensitive credentials are committed to version control


