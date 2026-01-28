-- TrustTrip Database Seed Data (after running init_schema migration)

-- Insert Users
INSERT INTO "User" (id, name, email, password, "profileImage", bio, phone, verified, "createdAt", "updatedAt") VALUES
('user_alice', 'Alice Johnson', 'alice@trusttrip.com', 'hashed_password_1', 'https://api.example.com/avatar/alice.jpg', 'Adventure seeker and travel enthusiast', '+1-555-0101', true, NOW(), NOW()),
('user_bob', 'Bob Smith', 'bob@trusttrip.com', 'hashed_password_2', 'https://api.example.com/avatar/bob.jpg', 'Budget traveler exploring the world', '+1-555-0102', true, NOW(), NOW()),
('user_carol', 'Carol Davis', 'carol@trusttrip.com', 'hashed_password_3', 'https://api.example.com/avatar/carol.jpg', 'Luxury travel planner', '+1-555-0103', true, NOW(), NOW()),
('user_david', 'David Wilson', 'david@trusttrip.com', 'hashed_password_4', 'https://api.example.com/avatar/david.jpg', 'Cultural explorer and photographer', '+1-555-0104', false, NOW(), NOW()),
('user_emma', 'Emma Brown', 'emma@trusttrip.com', 'hashed_password_5', 'https://api.example.com/avatar/emma.jpg', 'Family travel specialist', '+1-555-0105', true, NOW(), NOW());

-- Insert Projects
INSERT INTO "Project" (id, title, description, destination, budget, currency, "startDate", "endDate", status, "imageUrl", "userId", "createdAt", "updatedAt") VALUES
('proj_europe', 'Summer Europe Tour', 'Exploring the best of Europe in summer', 'Europe', 5000, 'USD', '2026-06-01', '2026-08-31', 'PLANNING', 'https://api.example.com/projects/europe.jpg', 'user_alice', NOW(), NOW()),
('proj_asia', 'Southeast Asia Backpacking', 'Budget-friendly backpacking adventure', 'Southeast Asia', 3000, 'USD', '2026-07-01', '2026-09-30', 'PLANNING', 'https://api.example.com/projects/asia.jpg', 'user_bob', NOW(), NOW()),
('proj_japan', 'Japan Cultural Experience', 'Deep dive into Japanese culture', 'Japan', 4500, 'USD', '2026-05-15', '2026-06-15', 'ACTIVE', 'https://api.example.com/projects/japan.jpg', 'user_carol', NOW(), NOW()),
('proj_caribbean', 'Caribbean Beach Escape', 'Relaxing beach vacation in the Caribbean', 'Caribbean', 3500, 'USD', '2026-12-01', '2026-12-25', 'PLANNING', 'https://api.example.com/projects/caribbean.jpg', 'user_emma', NOW(), NOW());

-- Insert Reviews
INSERT INTO "Review" (id, rating, comment, "userId", "projectId", "createdAt", "updatedAt") VALUES
('rev_1', 5, 'Amazing experience! Highly recommended.', 'user_bob', 'proj_europe', NOW(), NOW()),
('rev_2', 4, 'Good value for money but crowded during peak season.', 'user_emma', 'proj_europe', NOW(), NOW()),
('rev_3', 5, 'Best backpacking trip ever!', 'user_alice', 'proj_asia', NOW(), NOW()),
('rev_4', 3, 'Fun but physically demanding.', 'user_carol', 'proj_asia', NOW(), NOW());

-- Insert Bookings
INSERT INTO "Booking" (id, quantity, "totalPrice", status, "bookingDate", "userId", "projectId", "createdAt", "updatedAt") VALUES
('book_1', 2, 10000, 'CONFIRMED', NOW(), 'user_bob', 'proj_europe', NOW(), NOW()),
('book_2', 1, 3000, 'PENDING', NOW(), 'user_emma', 'proj_asia', NOW(), NOW()),
('book_3', 3, 7500, 'CONFIRMED', NOW(), 'user_carol', 'proj_europe', NOW(), NOW());

-- Insert Payments
INSERT INTO "Payment" (id, amount, currency, "paymentMethod", "transactionId", status, "paidAt", "userId", "projectId", "bookingId", "createdAt", "updatedAt") VALUES
('pay_1', 10000, 'USD', 'credit_card', 'TXN_001_20260128', 'COMPLETED', NOW(), 'user_bob', 'proj_europe', 'book_1', NOW(), NOW()),
('pay_2', 3000, 'USD', 'paypal', 'TXN_002_20260128', 'PENDING', NULL, 'user_emma', 'proj_asia', 'book_2', NOW(), NOW()),
('pay_3', 7500, 'USD', 'bank_transfer', 'TXN_003_20260128', 'COMPLETED', NOW(), 'user_carol', 'proj_europe', 'book_3', NOW(), NOW());

-- Insert Refunds
INSERT INTO "Refund" (id, reason, "refundAmount", status, "paymentId", "userId", "createdAt", "updatedAt") VALUES
('refund_1', 'Customer requested cancellation', 2500, 'REQUESTED', 'pay_1', 'user_bob', NOW(), NOW());
