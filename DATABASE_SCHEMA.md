# Database Schema Documentation

## Overview
This document describes the normalized PostgreSQL schema for the TrustTrip bus ticket refund transparency system. The schema is designed following database normalization principles (1NF, 2NF, 3NF) to ensure data integrity, eliminate redundancy, and support scalable operations.

## Core Entities and Relationships

### 1. User
**Purpose**: Represents customers who book bus tickets
- **Primary Key**: `id` (CUID)
- **Unique Constraints**: `email`, `phoneNumber`
- **Indexes**: `email`, `phoneNumber` (for fast lookups during login/booking)
- **Relationships**: One-to-many with Bookings and Refunds

### 2. Bus
**Purpose**: Represents the fleet of buses available for routes
- **Primary Key**: `id` (CUID)
- **Unique Constraints**: `busNumber`
- **Indexes**: `busNumber`, `busType`
- **Relationships**: One-to-many with Routes

### 3. Route
**Purpose**: Represents travel routes between cities with specific buses
- **Primary Key**: `id` (CUID)
- **Unique Constraints**: `routeCode`
- **Foreign Keys**: `busId` → Bus (CASCADE DELETE)
- **Indexes**: `routeCode`, `departureCity`, `arrivalCity`, `busId`
- **Relationships**: Many-to-one with Bus, One-to-many with Schedules

### 4. Schedule
**Purpose**: Represents specific scheduled trips for routes
- **Primary Key**: `id` (CUID)
- **Foreign Keys**: `routeId` → Route (CASCADE DELETE)
- **Indexes**: `departureTime`, `status`, `routeId`
- **Relationships**: Many-to-one with Route, One-to-many with Bookings

### 5. Booking
**Purpose**: Represents individual ticket bookings
- **Primary Key**: `id` (CUID)
- **Unique Constraints**: `bookingNumber`
- **Foreign Keys**: 
  - `userId` → User (CASCADE DELETE)
  - `scheduleId` → Schedule (CASCADE DELETE)
- **Indexes**: `bookingNumber`, `userId`, `scheduleId`, `bookingStatus`
- **Relationships**: Many-to-one with User and Schedule, One-to-one with Refund

### 6. Refund
**Purpose**: Represents refund calculations and processing
- **Primary Key**: `id` (CUID)
- **Unique Constraints**: `refundNumber`
- **Foreign Keys**: 
  - `userId` → User (CASCADE DELETE)
  - `bookingId` → Booking (CASCADE DELETE)
- **Indexes**: `refundNumber`, `userId`, `refundStatus`, `requestedAt`
- **Relationships**: Many-to-one with User, One-to-one with Booking

## Normalization Analysis

### First Normal Form (1NF)
✅ **Achieved**: All tables have:
- Atomic values in all columns
- No repeating groups
- Primary key defined for each table
- Each column contains single-valued attributes

### Second Normal Form (2NF)
✅ **Achieved**: All tables meet 1NF and:
- All non-key attributes are fully functionally dependent on primary key
- No partial dependencies exist
- Example: In Booking table, `ticketPrice` depends on the entire primary key, not just part of it

### Third Normal Form (3NF)
✅ **Achieved**: All tables meet 2NF and:
- No transitive dependencies
- All non-key attributes depend only on the primary key
- Example: Route information is separated from Schedule to avoid storing redundant route data

## Key Design Decisions

### 1. **Cascade Delete Strategy**
- **User deletion**: Removes all associated bookings and refunds
- **Bus deletion**: Removes all routes and dependent data
- **Route deletion**: Removes schedules and cascades to bookings
- **Rationale**: Maintains referential integrity while allowing clean data removal

### 2. **Indexing Strategy**
- **Primary Keys**: Automatic B-tree indexes
- **Foreign Keys**: Explicit indexes for join performance
- **Lookup Fields**: Indexes on frequently queried fields (email, phone, booking numbers)
- **Time-based**: Indexes on datetime fields for scheduling queries

### 3. **Data Types**
- **IDs**: CUID for better URL safety and uniqueness
- **Monetary Values**: Float for simplicity (consider Decimal for production)
- **Phone Numbers**: String to handle international formats
- **Arrays**: PostgreSQL array type for bus amenities

### 4. **Enumeration Usage**
- **Type Safety**: Prevents invalid status values
- **Performance**: More efficient than string comparisons
- **Maintainability**: Clear definition of allowed values

## Scalability Considerations

### 1. **Query Performance**
- Strategic indexes on foreign keys and commonly filtered columns
- Separate tables prevent large table scans
- Normalized structure enables efficient JOIN operations

### 2. **Data Growth**
- Partitioning potential on time-based columns (bookings, refunds)
- Archive strategy for completed/old records
- Efficient relationships minimize data duplication

### 3. **Common Query Patterns**
- User bookings: Fast via `userId` index
- Route searches: Optimized with city indexes
- Refund calculations: Direct booking→refund relationship
- Schedule availability: Efficient filtering by departure time and status

## Business Rule Enforcement

### 1. **At Database Level**
- NOT NULL constraints on required fields
- UNIQUE constraints prevent duplicate bookings/refunds
- Foreign key constraints maintain data consistency
- Enum constraints enforce valid status values

### 2. **At Application Level** (Future Implementation)
- Refund calculation business logic
- Seat availability checking
- Booking time validation
- User permission validation

## Migration Strategy
The schema is designed for incremental deployment:
1. **Base Structure**: Users, Buses, Routes first
2. **Scheduling**: Schedules and Bookings
3. **Refund System**: Refunds with detailed tracking
4. **Future Extensions**: Additional features without breaking changes

This schema provides a solid foundation for the TrustTrip application while maintaining flexibility for future enhancements.