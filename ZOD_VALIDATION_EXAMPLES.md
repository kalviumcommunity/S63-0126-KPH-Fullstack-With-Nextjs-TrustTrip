# Zod Validation Examples

This document provides examples of testing the new Zod validation implementation.

## Test API Endpoints

### 1. Test User Creation (POST /api/users)

**Valid Request:**
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "John Doe",
    "password": "password123",
    "bio": "Test user bio",
    "phone": "+1-555-0123"
  }'
```

**Expected Response (Success):**
```json
{
  "success": true,
  "data": {
    "id": "cuid_123...",
    "email": "test@example.com",
    "name": "John Doe",
    "profileImage": null,
    "bio": "Test user bio",
    "phone": "+1-555-0123",
    "verified": false,
    "createdAt": "2026-01-29T..."
  },
  "message": "User created successfully"
}
```

**Invalid Request (Missing required field):**
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "password": "password123"
  }'
```

**Expected Response (Validation Error):**
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

**Invalid Request (Invalid email format):**
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-email",
    "name": "John Doe",
    "password": "password123"
  }'
```

**Expected Response (Validation Error):**
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Please provide a valid email address"
    }
  ]
}
```

### 2. Test Project Creation (POST /api/projects)

**Valid Request:**
```bash
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Trip to Japan",
    "description": "Exploring Tokyo and Kyoto",
    "destination": "Japan",
    "startDate": "2026-06-01",
    "endDate": "2026-06-15",
    "budget": 5000,
    "currency": "USD",
    "userId": "user_cuid_here"
  }'
```

**Invalid Request (End date before start date):**
```bash
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Trip to Japan",
    "destination": "Japan",
    "startDate": "2026-06-15",
    "endDate": "2026-06-01",
    "userId": "user_cuid_here"
  }'
```

**Expected Response (Validation Error):**
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "field": "endDate",
      "message": "End date must be after start date"
    }
  ]
}
```

### 3. Test Booking Creation (POST /api/bookings)

**Invalid Request (Negative quantity):**
```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": -1,
    "totalPrice": 1000,
    "userId": "user_cuid_here",
    "projectId": "project_cuid_here"
  }'
```

**Expected Response (Validation Error):**
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "field": "quantity",
      "message": "Quantity must be at least 1"
    }
  ]
}
```

### 4. Test Payment Creation (POST /api/payments)

**Invalid Request (Invalid payment method):**
```bash
curl -X POST http://localhost:3000/api/payments \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1000,
    "currency": "USD",
    "paymentMethod": "invalid_method",
    "transactionId": "txn_123456789",
    "userId": "user_cuid_here",
    "projectId": "project_cuid_here",
    "bookingId": "booking_cuid_here"
  }'
```

**Expected Response (Validation Error):**
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "field": "paymentMethod",
      "message": "Payment method must be one of: credit_card, debit_card, paypal, bank_transfer, cash"
    }
  ]
}
```

### 5. Test Review Creation (POST /api/reviews)

**Invalid Request (Rating out of range):**
```bash
curl -X POST http://localhost:3000/api/reviews \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 6,
    "comment": "Great trip!",
    "userId": "user_cuid_here",
    "projectId": "project_cuid_here"
  }'
```

**Expected Response (Validation Error):**
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "field": "rating",
      "message": "Rating cannot exceed 5 stars"
    }
  ]
}
```

### 6. Test Refund Creation (POST /api/refund)

**Invalid Request (Reason too short):**
```bash
curl -X POST http://localhost:3000/api/refund \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Bad",
    "paymentId": "payment_cuid_here",
    "userId": "user_cuid_here"
  }'
```

**Expected Response (Validation Error):**
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "field": "reason",
      "message": "Reason must be at least 10 characters long"
    }
  ]
}
```

## Testing with Development Server

1. Start the development server:
```bash
npm run dev
```

2. Use the curl commands above to test each endpoint
3. Check the browser network tab or server logs for validation responses
4. Try variations of the invalid requests to test different validation rules

## Key Validation Features Demonstrated

- **Required Field Validation**: Missing fields return specific error messages
- **Type Validation**: Numbers, strings, booleans are validated for correct types
- **Format Validation**: Emails, URLs, CUIDs, currency codes are format-checked
- **Range Validation**: Numbers have min/max constraints
- **Length Validation**: Strings have min/max length requirements
- **Custom Business Logic**: Date relationships, unique constraints
- **Enum Validation**: Payment methods and other enums are strictly validated
- **Consistent Error Format**: All validation errors follow the same structure