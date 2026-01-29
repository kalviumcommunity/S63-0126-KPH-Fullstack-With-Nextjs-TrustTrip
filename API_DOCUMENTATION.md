# TrustTrip API Documentation

## Overview

TrustTrip provides a RESTful API for managing travel projects, bookings, payments, and refunds. This document describes the API hierarchy, available endpoints, request/response formats, and pagination details.

## API Hierarchy

```
/api/
├── users/         # User management
├── projects/      # Travel projects/trips
├── bookings/      # Trip bookings
├── payments/      # Payment transactions
├── refunds/       # Refund requests
├── reviews/       # Project reviews
└── test/          # Database connection test
```

## Base URL

All API endpoints are relative to the server root:

```
http://localhost:3000/api/
```

## Content Type

All requests and responses use JSON format:

```
Content-Type: application/json
```

---

## Users API

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List all users with pagination and filtering |
| POST | `/api/users` | Create a new user |

### GET /api/users

List users with optional pagination and filtering.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number (1-indexed) |
| limit | number | 10 | Items per page (max 100) |
| search | string | - | Search by name or email |
| verified | boolean | - | Filter by verification status |
| sortBy | string | createdAt | Sort field (createdAt, name, email) |
| sortOrder | string | desc | Sort order (asc, desc) |

**Example Request:**

```bash
curl -X GET "http://localhost:3000/api/users?page=1&limit=10&search=john"
```

**Example Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "user123",
      "email": "john@example.com",
      "name": "John Doe",
      "verified": true,
      "createdAt": "2024-01-15T10:30:00Z",
      "_count": {
        "projects": 3,
        "reviews": 5,
        "bookings": 2
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### POST /api/users

Create a new user.

**Request Body:**

```json
{
  "email": "user@example.com",
  "name": "User Name",
  "password": "securepassword",
  "bio": "Optional bio",
  "phone": "+1234567890",
  "profileImage": "https://example.com/avatar.jpg"
}
```

**Example Request:**

```bash
curl -X POST "http://localhost:3000/api/users" \
  -H "Content-Type: application/json" \
  -d '{"email":"newuser@example.com","name":"New User","password":"password123"}'
```

**Example Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "id": "user456",
    "email": "newuser@example.com",
    "name": "New User",
    "verified": false,
    "createdAt": "2024-01-20T14:30:00Z"
  },
  "message": "User created successfully"
}
```

---

## Projects API

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | List all projects with pagination and filtering |
| POST | `/api/projects` | Create a new project |

### GET /api/projects

List travel projects with optional pagination and filtering.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 10 | Items per page (max 100) |
| userId | string | - | Filter by owner user ID |
| status | string | - | Filter by project status |
| destination | string | - | Filter by destination |
| search | string | - | Search in title, description, destination |
| sortBy | string | createdAt | Sort field |
| sortOrder | string | desc | Sort order |

**Example Request:**

```bash
curl -X GET "http://localhost:3000/api/projects?page=1&limit=10&status=PLANNING"
```

### POST /api/projects

Create a new travel project.

**Request Body:**

```json
{
  "title": "Europe Tour 2024",
  "description": "A wonderful trip across Europe",
  "destination": "Paris, Rome, Barcelona",
  "startDate": "2024-06-01T00:00:00Z",
  "endDate": "2024-06-15T00:00:00Z",
  "budget": 5000,
  "currency": "USD",
  "userId": "user123",
  "imageUrl": "https://example.com/project.jpg"
}
```

---

## Bookings API

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bookings` | List all bookings with pagination and filtering |
| POST | `/api/bookings` | Create a new booking |

### GET /api/bookings

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 10 | Items per page |
| userId | string | - | Filter by user |
| projectId | string | - | Filter by project |
| status | string | - | Filter by status (PENDING, CONFIRMED, COMPLETED, CANCELLED) |

### POST /api/bookings

**Request Body:**

```json
{
  "quantity": 2,
  "totalPrice": 1500.00,
  "userId": "user123",
  "projectId": "project456"
}
```

---

## Payments API

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/payments` | List all payments with pagination and filtering |
| POST | `/api/payments` | Create a new payment |

### GET /api/payments

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 10 | Items per page |
| userId | string | - | Filter by user |
| projectId | string | - | Filter by project |
| status | string | - | Filter by status (PENDING, COMPLETED, FAILED, CANCELLED) |

### POST /api/payments

**Request Body:**

```json
{
  "amount": 1500.00,
  "currency": "USD",
  "paymentMethod": "credit_card",
  "transactionId": "TXN123456789",
  "userId": "user123",
  "projectId": "project456",
  "bookingId": "booking789"
}
```

**Note:** Creating a payment automatically confirms the associated booking.

---

## Refunds API

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/refunds` | List all refund requests with pagination and filtering |
| POST | `/api/refunds` | Create a new refund request |

### GET /api/refunds

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 10 | Items per page |
| userId | string | - | Filter by user |
| status | string | - | Filter by status (REQUESTED, APPROVED, PROCESSED, REJECTED) |

### POST /api/refunds

**Request Body:**

```json
{
  "reason": "Changed travel plans",
  "paymentId": "payment123",
  "userId": "user456"
}
```

**Rules:**
- Only completed payments can be refunded
- Each payment can only have one refund request
- Refund amount equals the original payment amount

---

## Reviews API

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reviews` | List all reviews with pagination and filtering |
| POST | `/api/reviews` | Create a new review |

### GET /api/reviews

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 10 | Items per page |
| userId | string | - | Filter by user |
| projectId | string | - | Filter by project |
| minRating | number | - | Minimum rating (1-5) |
| maxRating | number | - | Maximum rating (1-5) |

### POST /api/reviews

**Request Body:**

```json
{
  "rating": 5,
  "comment": "Amazing trip experience!",
  "userId": "user123",
  "projectId": "project456"
}
```

**Rules:**
- Rating must be between 1 and 5
- Each user can only review a project once

---

## Test API

### GET /api/test

Database connection test endpoint.

**Example Request:**

```bash
curl -X GET "http://localhost:3000/api/test"
```

**Example Response:**

```json
{
  "success": true,
  "message": "Database connection successful!",
  "data": {
    "usersCount": 25,
    "projectsCount": 50,
    "timestamp": "2024-01-20T15:30:00Z"
  }
}
```

---

## Error Handling

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created (resource successfully created) |
| 400 | Bad Request (validation error) |
| 404 | Not Found (resource doesn't exist) |
| 409 | Conflict (duplicate entry or violation) |
| 500 | Internal Server Error |

### Error Response Format

```json
{
  "success": false,
  "error": "Human-readable error message",
  "details": ["List", "of", "validation", "errors"]
}
```

### Example Error Responses

**400 Bad Request:**

```json
{
  "success": false,
  "error": "Validation failed",
  "details": ["email is required", "name is required"]
}
```

**404 Not Found:**

```json
{
  "success": false,
  "error": "User not found"
}
```

**409 Conflict:**

```json
{
  "success": false,
  "error": "Email already in use"
}
```

---

## Pagination

All list endpoints support pagination using `page` and `limit` query parameters.

**Pagination Response Structure:**

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

**Pagination Parameters:**

| Parameter | Description |
|-----------|-------------|
| page | Page number (1-indexed, minimum 1) |
| limit | Items per page (minimum 1, maximum 100) |
| total | Total number of items |
| totalPages | Total number of pages |
| hasNext | True if there are more pages |
| hasPrev | True if there are previous pages |

---

## Curl Testing Examples

### Users

```bash
# List users
curl -X GET "http://localhost:3000/api/users?page=1&limit=10"

# Create user
curl -X POST "http://localhost:3000/api/users" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User","password":"password123"}'
```

### Projects

```bash
# List projects
curl -X GET "http://localhost:3000/api/projects?page=1&limit=10&status=PLANNING"

# Create project
curl -X POST "http://localhost:3000/api/projects" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Summer Vacation",
    "destination": "Beach Resort",
    "startDate": "2024-07-01T00:00:00Z",
    "endDate": "2024-07-14T00:00:00Z",
    "budget": 3000,
    "userId": "user123"
  }'
```

### Bookings

```bash
# List bookings
curl -X GET "http://localhost:3000/api/bookings?userId=user123&status=CONFIRMED"

# Create booking
curl -X POST "http://localhost:3000/api/bookings" \
  -H "Content-Type: application/json" \
  -d '{"quantity":2,"totalPrice":500.00,"userId":"user123","projectId":"project456"}'
```

### Payments

```bash
# List payments
curl -X GET "http://localhost:3000/api/payments?status=COMPLETED"

# Create payment
curl -X POST "http://localhost:3000/api/payments" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 500.00,
    "currency": "USD",
    "paymentMethod": "credit_card",
    "transactionId": "TXN123456789",
    "userId": "user123",
    "projectId": "project456",
    "bookingId": "booking789"
  }'
```

### Refunds

```bash
# List refunds
curl -X GET "http://localhost:3000/api/refunds?status=REQUESTED"

# Create refund
curl -X POST "http://localhost:3000/api/refunds" \
  -H "Content-Type: application/json" \
  -d '{"reason":"Changed plans","paymentId":"payment123","userId":"user456"}'
```

### Reviews

```bash
# List reviews
curl -X GET "http://localhost:3000/api/reviews?projectId=project456&minRating=4"

# Create review
curl -X POST "http://localhost:3000/api/reviews" \
  -H "Content-Type: application/json" \
  -d '{"rating":5,"comment":"Excellent experience!","userId":"user123","projectId":"project456"}'
```

### Test

```bash
# Test database connection
curl -X GET "http://localhost:3000/api/test"
```

---

## Reflection: Why Naming Conventions and Structure Matter

### Consistency in API Design

Following RESTful naming conventions and maintaining a consistent directory structure provides significant benefits for team collaboration and long-term project maintainability:

### 1. Predictability

- **Standardized endpoints**: `/api/users` instead of `/api/getAllUsers` or `/api/userList`
- **HTTP verbs**: GET for retrieval, POST for creation - developers know what to expect
- **Plural nouns**: Using `/users` instead of `/user` aligns with industry standards

### 2. Discoverability

- **Intuitive hierarchy**: New team members can find endpoints based on the resource name
- **Self-documenting structure**: The file structure itself serves as documentation
- **Easy navigation**: No need to memorize endpoint paths

### 3. Scalability

- **Modular design**: Each resource is isolated, making it easy to add new features
- **Consistent patterns**: Applying the same pattern to all resources reduces cognitive load
- **Maintainable code**: Clear structure makes bug fixes and updates faster

### 4. Team Collaboration

- **Reduced communication overhead**: Conventions are understood by all team members
- **Easier code reviews**: Reviewers can quickly understand the intent
- **Onboarding efficiency**: New developers can contribute faster

### 5. API Consumer Experience

- **Consistent client implementation**: Frontend and mobile teams can create reusable components
- **Standard tooling**: Works with API documentation generators (Swagger, Postman)
- **Versioning readiness**: Structured APIs are easier to version

### Best Practices Applied

1. **File-based routing**: `app/api/users/route.ts` automatically maps to `/api/users`
2. **REST conventions**: Proper use of HTTP methods and status codes
3. **Pagination**: Consistent pagination across all list endpoints
4. **Error handling**: Uniform error response format
5. **Filtering and sorting**: Standard query parameter patterns

This structured approach ensures that TrustTrip's API is professional-grade, maintainable, and ready for future expansion.

