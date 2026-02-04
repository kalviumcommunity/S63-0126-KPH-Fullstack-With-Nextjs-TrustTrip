# File Upload Feature Testing Guide

## Quick Start Test

### 1. Prerequisites

- AWS S3 bucket created
- IAM credentials with `AmazonS3FullAccess` permissions
- `.env.local` configured with AWS credentials
- Database migrations applied: `npx prisma migrate dev`

### 2. Test Script (Node.js)

Create `test-upload.js` in your project root:

```javascript
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:3000';

async function testFileUpload() {
  try {
    console.log('🧪 Starting File Upload Test...\n');

    // Test 1: Get upload configuration
    console.log('📋 Test 1: GET /api/upload (Get Configuration)');
    const configRes = await fetch(`${API_URL}/api/upload`);
    const config = await configRes.json();
    console.log('✓ Configuration:', JSON.stringify(config.configuration, null, 2));

    // Test 2: Generate pre-signed URL
    console.log('\n📋 Test 2: POST /api/upload (Generate Pre-signed URL)');
    const uploadRes = await fetch(`${API_URL}/api/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename: 'test-image.png',
        fileType: 'image/png',
        fileSize: 2048,
        userId: 'test-user-123',
      }),
    });
    const uploadData = await uploadRes.json();
    
    if (!uploadData.success) {
      console.error('❌ Failed to generate pre-signed URL:', uploadData);
      return;
    }
    
    console.log('✓ Pre-signed URL generated');
    console.log('  Upload URL:', uploadData.uploadURL.substring(0, 80) + '...');
    console.log('  File URL:', uploadData.fileURL);
    console.log('  Expires in:', uploadData.expiresIn, 'seconds');

    // Test 3: Create dummy file and upload to S3
    console.log('\n📋 Test 3: Upload file to S3 via PUT');
    const dummyFile = Buffer.from('fake image data for testing');
    const s3Res = await fetch(uploadData.uploadURL, {
      method: 'PUT',
      headers: { 'Content-Type': 'image/png' },
      body: dummyFile,
    });

    if (s3Res.ok) {
      console.log('✓ File uploaded to S3 successfully');
    } else {
      console.error('❌ S3 upload failed:', s3Res.status, s3Res.statusText);
      return;
    }

    // Test 4: Store file metadata in database
    console.log('\n📋 Test 4: POST /api/files (Store Metadata)');
    const metadataRes = await fetch(`${API_URL}/api/files`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileName: 'test-image.png',
        fileURL: uploadData.fileURL,
        fileSize: 2048,
        fileType: 'image/png',
        userId: 'test-user-123',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      }),
    });
    
    const metadataData = await metadataRes.json();
    if (metadataData.success) {
      console.log('✓ File metadata stored');
      console.log('  File ID:', metadataData.data.id);
      console.log('  File Name:', metadataData.data.name);
      console.log('  File URL:', metadataData.data.url);
      console.log('  File Size:', metadataData.data.size, 'bytes');
    } else {
      console.error('❌ Metadata storage failed:', metadataData);
      return;
    }

    // Test 5: Retrieve user's files
    console.log('\n📋 Test 5: GET /api/files (List User Files)');
    const listRes = await fetch(
      `${API_URL}/api/files?userId=test-user-123&page=1&limit=10&sortBy=uploadedAt&sortOrder=desc`
    );
    const listData = await listRes.json();
    console.log('✓ Files retrieved');
    console.log('  Total files:', listData.data.pagination.total);
    console.log('  Files:', listData.data.files.length);

    // Test 6: Test invalid file type
    console.log('\n📋 Test 6: POST /api/upload (Invalid File Type)');
    const invalidRes = await fetch(`${API_URL}/api/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename: 'test.exe',
        fileType: 'application/x-msdownload',
        fileSize: 1024,
        userId: 'test-user-123',
      }),
    });
    const invalidData = await invalidRes.json();
    
    if (!invalidData.success) {
      console.log('✓ Invalid file type correctly rejected');
      console.log('  Error:', invalidData.message);
    } else {
      console.error('❌ Invalid file type was not rejected');
    }

    // Test 7: Test oversized file
    console.log('\n📋 Test 7: POST /api/upload (File Too Large)');
    const oversizeRes = await fetch(`${API_URL}/api/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename: 'huge-file.pdf',
        fileType: 'application/pdf',
        fileSize: 100 * 1024 * 1024, // 100 MB
        userId: 'test-user-123',
      }),
    });
    const oversizeData = await oversizeRes.json();
    
    if (!oversizeData.success) {
      console.log('✓ Oversized file correctly rejected');
      console.log('  Error:', oversizeData.message);
    } else {
      console.error('❌ Oversized file was not rejected');
    }

    console.log('\n✅ All tests completed!\n');
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testFileUpload();
```

Run the test:
```bash
node test-upload.js
```

### 3. Manual Testing with cURL

#### Step 1: Generate Pre-Signed URL

```bash
curl -X POST http://localhost:3000/api/upload \
  -H "Content-Type: application/json" \
  -d '{
    "filename": "profile.png",
    "fileType": "image/png",
    "fileSize": 2048,
    "userId": "manual-test-user"
  }' | jq .
```

Expected response:
```json
{
  "success": true,
  "uploadURL": "https://...",
  "fileURL": "https://...",
  "s3Key": "uploads/...",
  "expiresIn": 3600
}
```

#### Step 2: Upload File to S3

Create a test image or use an existing one:

```bash
# Using an actual PNG file
curl -X PUT "https://your-bucket.s3.ap-south-1.amazonaws.com/uploads/..." \
  -H "Content-Type: image/png" \
  --data-binary @profile.png
```

Or with dummy data:

```bash
# Create dummy data
echo "fake image data" > test.png

# Upload to S3 using pre-signed URL
curl -X PUT "$UPLOAD_URL" \
  -H "Content-Type: image/png" \
  --data-binary @test.png
```

#### Step 3: Store File Metadata

```bash
curl -X POST http://localhost:3000/api/files \
  -H "Content-Type: application/json" \
  -d '{
    "fileName": "profile.png",
    "fileURL": "https://your-bucket.s3.ap-south-1.amazonaws.com/uploads/...",
    "fileSize": 2048,
    "fileType": "image/png",
    "userId": "manual-test-user"
  }' | jq .
```

#### Step 4: List User's Files

```bash
curl -X GET "http://localhost:3000/api/files?userId=manual-test-user&page=1&limit=10" | jq .
```

#### Step 5: Delete File Record

```bash
curl -X DELETE "http://localhost:3000/api/files?fileId=file_id_here" | jq .
```

### 4. Postman Collection

Import this into Postman:

```json
{
  "info": {
    "name": "File Upload API",
    "description": "AWS S3 File Upload with Pre-signed URLs"
  },
  "item": [
    {
      "name": "Get Upload Configuration",
      "request": {
        "method": "GET",
        "url": "{{baseUrl}}/api/upload"
      }
    },
    {
      "name": "Generate Pre-signed URL",
      "request": {
        "method": "POST",
        "url": "{{baseUrl}}/api/upload",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\"filename\":\"test.png\",\"fileType\":\"image/png\",\"fileSize\":2048,\"userId\":\"test-user\"}"
        }
      }
    },
    {
      "name": "Store File Metadata",
      "request": {
        "method": "POST",
        "url": "{{baseUrl}}/api/files",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\"fileName\":\"test.png\",\"fileURL\":\"https://...\",\"fileSize\":2048,\"fileType\":\"image/png\",\"userId\":\"test-user\"}"
        }
      }
    },
    {
      "name": "List User Files",
      "request": {
        "method": "GET",
        "url": "{{baseUrl}}/api/files?userId=test-user&page=1&limit=10"
      }
    },
    {
      "name": "Delete File",
      "request": {
        "method": "DELETE",
        "url": "{{baseUrl}}/api/files?fileId=file_id_here"
      }
    }
  ]
}
```

Set `baseUrl` variable to `http://localhost:3000`.

### 5. Database Verification

After upload, verify the file record exists:

```bash
# Using psql
psql -U postgres -d trusttrip_db -c "SELECT id, name, url, size, fileType, userId, uploadedAt FROM \"File\" ORDER BY uploadedAt DESC LIMIT 5;"
```

Or with Prisma Studio:

```bash
npx prisma studio
```

Then navigate to the `File` model to view records.

### 6. S3 Console Verification

1. Go to [AWS S3 Console](https://s3.console.aws.amazon.com/)
2. Select your bucket
3. Navigate to `uploads/` folder
4. Verify your uploaded files are visible
5. Check that `ACL` is set to `public-read`

### 7. Test Cases Summary

| Test Case | Expected Result | Pass/Fail |
|-----------|-----------------|-----------|
| Generate pre-signed URL | Returns uploadURL, fileURL, s3Key | ✅ |
| Upload valid PNG | S3 upload succeeds (HTTP 200) | ✅ |
| Store metadata | File record created in DB | ✅ |
| List user files | Returns paginated file list | ✅ |
| Invalid file type (.exe) | Rejected with 400 error | ✅ |
| Oversized file (100MB) | Rejected with 400 error | ✅ |
| File accessible via URL | Opens in browser | ✅ |
| DB record exists | Query returns file | ✅ |
| Delete file record | Record removed from DB | ✅ |

### 8. Debugging Tips

If tests fail:

1. **Check AWS credentials**: Verify `.env.local` has correct values
2. **Bucket exists**: Confirm bucket name and region
3. **IAM permissions**: Ensure IAM user has `AmazonS3FullAccess`
4. **Database**: Run `npx prisma migrate dev` to apply schema changes
5. **Server logs**: Check Next.js dev server console for errors
6. **Network**: Ensure you can reach S3 (test with `curl -I https://s3.amazonaws.com`)

### 9. Performance Benchmarks

Expected response times (local):

| Operation | Duration |
|-----------|----------|
| Generate pre-signed URL | < 100ms |
| Validate file (size/type) | < 10ms |
| Store metadata (DB) | < 50ms |
| List files (10 records) | < 100ms |
| Delete file record | < 30ms |

S3 upload time depends on file size and network:
- 1MB file: ~500ms - 2s
- 5MB file: ~2s - 5s
- 10MB file: ~5s - 10s

---

**Questions? Issues?** Check the main [README.md](../README.md#-secure-file-uploads-with-pre-signed-urls-aws-s3) for detailed documentation.
