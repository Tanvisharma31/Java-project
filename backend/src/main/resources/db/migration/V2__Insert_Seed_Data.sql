-- ============================================================
-- VIDYUTSEVA - SEED DATA
-- Flyway Migration: Insert Sample Data for Testing
-- ============================================================

-- Insert Default Admin (password: Admin@123 - BCrypt encoded)
INSERT INTO admins (username, password) VALUES 
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH');

-- Insert Staff Members
INSERT INTO staff (staff_id, name, password, area_assigned, status) VALUES 
('STAFF001', 'Rajesh Kumar', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', 'North Zone', 'Active'),
('STAFF002', 'Priya Sharma', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', 'South Zone', 'Active'),
('STAFF003', 'Amit Patel', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', 'East Zone', 'Active');

-- Insert Tariff Configurations
INSERT INTO tariff_config (connection_type, fixed_charge_per_kw, slab1_rate, slab2_rate, slab3_rate, electricity_duty_pct) VALUES 
('RESIDENTIAL', 40.00, 3.50, 4.50, 5.50, 0.0500),
('COMMERCIAL', 60.00, 5.50, 6.50, 7.50, 0.0800);

-- Insert Sample Customers
INSERT INTO login (email, user_id, password, user_type, status) VALUES 
('tanvi@example.com', 'tanvi_2004', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', 'Customer', 'Active'),
('ramesh@example.com', 'ramesh_kumar', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', 'Customer', 'Active'),
('sita@example.com', 'sita_devi', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', 'Customer', 'Active');

INSERT INTO customers (consumer_id, name, email, mobile, password, title, user_id, status, address_area, city, pincode, connection_type, sanctioned_load_kw, previous_meter_reading) VALUES 
('1000000000001', 'Tanvi Sharma', 'tanvi@example.com', '9876543210', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', 'Ms', 'tanvi_2004', 'Active', 'North Zone', 'Mumbai', '400001', 'RESIDENTIAL', 3.00, 1200),
('1000000000002', 'Ramesh Kumar', 'ramesh@example.com', '9876543211', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', 'Mr', 'ramesh_kumar', 'Active', 'South Zone', 'Delhi', '110001', 'RESIDENTIAL', 5.00, 2500),
('1000000000003', 'Sita Devi', 'sita@example.com', '9876543212', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', 'Mrs', 'sita_devi', 'Active', 'East Zone', 'Bangalore', '560001', 'COMMERCIAL', 10.00, 5000);

-- Insert Sample Bills
INSERT INTO bills (bill_id, consumer_id, previous_reading, current_reading, units_consumed, amount, late_fee, total_payable, billing_month, bill_date, due_date, status) VALUES 
('BILL-2026-08001', '1000000000001', 1200, 1350, 150, 525.00, 0.00, 525.00, 'August-2026', '2026-08-01', '2026-08-25', 'PENDING'),
('BILL-2026-08002', '1000000000002', 2500, 2680, 180, 630.00, 0.00, 630.00, 'August-2026', '2026-08-01', '2026-08-25', 'PENDING'),
('BILL-2026-07001', '1000000000001', 1100, 1200, 100, 350.00, 0.00, 350.00, 'July-2026', '2026-07-01', '2026-07-25', 'PAID'),
('BILL-2026-07002', '1000000000002', 2400, 2500, 100, 350.00, 0.00, 350.00, 'July-2026', '2026-07-01', '2026-07-25', 'PAID');

-- Insert Sample Payments
INSERT INTO payments (transaction_id, receipt_number, consumer_id, bill_ids, total_paid, payment_method, masked_card, payment_date, status) VALUES 
('TXN-2026-0815001', 'RCPT-2026-0815001', '1000000000001', 'BILL-2026-07001', 350.00, 'CARD', '************4242', '2026-08-15 10:30:00', 'SUCCESS'),
('TXN-2026-0814001', 'RCPT-2026-0814001', '1000000000002', 'BILL-2026-07002', 350.00, 'UPI', 'tanvi@upi', '2026-08-14 15:45:00', 'SUCCESS');

-- Insert Sample Complaints
INSERT INTO complaints (complaint_id, consumer_id, customer_name, complaint_type, category, assigned_area, description, priority, status, created_at) VALUES 
('CMP-2026-000001', '1000000000001', 'Tanvi Sharma', 'Billing Related', 'Incorrect Bill Amount', 'North Zone', 'My bill amount seems higher than usual. Please check the meter reading.', 'MEDIUM', 'OPEN', '2026-08-13 09:20:00'),
('CMP-2026-000002', '1000000000002', 'Ramesh Kumar', 'Voltage Related', 'Low Voltage', 'South Zone', 'Voltage fluctuation is affecting my appliances. Please investigate.', 'HIGH', 'IN_PROGRESS', '2026-08-12 14:00:00');

-- Insert Sample Service Requests
INSERT INTO service_requests (request_id, consumer_id, customer_name, request_type, current_value, requested_value, reason, status, created_at) VALUES 
('SR-2026-000001', '1000000000001', 'Tanvi Sharma', 'LOAD_CHANGE', '3.00', '5.00', 'Need additional load for new AC installation', 'PENDING', '2026-08-11 10:00:00'),
('SR-2026-000002', '1000000000002', 'Ramesh Kumar', 'CATEGORY_CHANGE', 'RESIDENTIAL', 'COMMERCIAL', 'Converting residence to small office', 'UNDER_REVIEW', '2026-08-10 15:30:00');

-- Insert Sample Notifications
INSERT INTO notifications (consumer_id, message, is_read, created_at) VALUES 
('1000000000001', 'Your August electricity bill has been generated. Amount: ₹525.00', 0, '2026-08-15 10:30:00'),
('1000000000001', 'Payment successful. Transaction ID: TXN-2026-0815001', 0, '2026-08-15 10:30:00'),
('1000000000001', 'Your complaint CMP-2026-000001 has been registered.', 1, '2026-08-13 09:20:00'),
('1000000000002', 'Your August electricity bill has been generated. Amount: ₹630.00', 0, '2026-08-15 10:30:00'),
('1000000000002', 'Payment successful. Transaction ID: TXN-2026-0814001', 1, '2026-08-14 15:45:00');

-- Insert Sample Feedback
INSERT INTO feedback (feedback_number, consumer_id, type, category, subject, details, rating, contact_info, status) VALUES 
('FB-87654321', '1000000000001', 'SERVICE', 'Response Time', 'Quick resolution of billing issue', 'I was very impressed with how quickly my billing query was resolved. The staff was helpful and professional.', 4, 'tanvi@example.com', 'RESOLVED'),
('FB-87654320', '1000000000002', 'BILLING', 'Billing Accuracy', 'Incorrect bill amount', 'My bill for August seems incorrect. The units consumed don\'t match my actual usage. Please review.', 2, '9876543211', 'UNDER_REVIEW'),
('FB-87654319', '1000000000001', 'WEBSITE', 'Ease of Use', 'Great user experience', 'The new website is very easy to navigate. I could pay my bill without any issues. Keep up the good work!', 5, '', 'RESOLVED');