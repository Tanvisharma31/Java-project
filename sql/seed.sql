-- ============================================================
-- ELECTRICITY BILL MANAGEMENT SYSTEM - SEED DATA
-- ============================================================
-- Run schema.sql first before executing this file.
-- Matches the dummy data loaded in MainApp.java → loadDummyData()
-- ============================================================

USE electricity_bill_db;

-- ============================================================
-- Admin
-- Credentials: admin / admin123
-- ============================================================
INSERT INTO admins (username, password) VALUES
('admin', 'admin123');

-- ============================================================
-- Tariff Configuration
-- Mirrors: TariffConfig.java static fields
-- ============================================================
INSERT INTO tariff_config
    (connection_type, fixed_charge_per_kw, slab1_rate, slab2_rate, slab3_rate, electricity_duty_pct)
VALUES
    ('RESIDENTIAL', 50.00, 3.50, 5.00, 7.00, 0.0500),
    ('COMMERCIAL',  100.00, 6.00, 8.00, 10.00, 0.0500);

-- ============================================================
-- Staff
-- Matches: staffList[] in MainApp.java → loadDummyData()
-- ============================================================
INSERT INTO staff (staff_id, name, password, area_assigned) VALUES
('S101', 'Ramesh Kumar', 'staff123', 'Delhi North'),
('S102', 'Suresh Verma', 'staff123', 'Delhi South');

-- ============================================================
-- Customers
-- Matches: customers[] in MainApp.java → loadDummyData()
-- Updated per sheet requirements: 13-digit consumer ID, title, user_id, status
-- ============================================================
INSERT INTO customers
    (consumer_id, name, email, mobile, password, title, user_id, status, address_area, connection_type, sanctioned_load_kw, previous_meter_reading)
VALUES
    ('1234567890123', 'Amit Sharma',  'amit@test.com',  '9876543210', 'pass123', 'Mr', 'amit123', 'Active', 'Delhi North', 'RESIDENTIAL', 2.00, 1500),
    ('1234567890124', 'Priya Singh',  'priya@test.com', '8765432109', 'pass123', 'Mrs', 'priya123', 'Active', 'Delhi South', 'COMMERCIAL',  5.00, 5000);

-- ============================================================
-- Bills
-- Matches: bills[] in MainApp.java → loadDummyData()
-- Updated to use 13-digit consumer IDs
-- B1001: Overdue (past due date) to trigger late fee logic
-- B1002: Current, due in future
-- ============================================================
INSERT INTO bills
    (bill_id, consumer_id, previous_reading, current_reading, units_consumed, amount, late_fee, total_payable, bill_date, due_date, status, payment_method)
VALUES
    (
        'B1001', '1234567890123', 1255, 1500, 245, 1225.00, 0.00, 1225.00,
        DATE_SUB(CURDATE(), INTERVAL 20 DAY),
        DATE_SUB(CURDATE(), INTERVAL 5 DAY),
        'PENDING', 'N/A'
    ),
    (
        'B1002', '1234567890124', 4850, 5000, 150, 600.00, 0.00, 600.00,
        CURDATE(),
        DATE_ADD(CURDATE(), INTERVAL 15 DAY),
        'PENDING', 'N/A'
    );

-- ============================================================
-- Complaints
-- Matches: complaints[] in MainApp.java → loadDummyData()
-- Updated to use 13-digit consumer IDs
-- ============================================================
INSERT INTO complaints (complaint_id, consumer_id, description, priority, status) VALUES
('COMP1001', '1234567890123', 'Meter reading incorrect', 'HIGH', 'OPEN');

-- ============================================================
-- Service Requests
-- Matches: requests[] in MainApp.java → loadDummyData()
-- Updated to use 13-digit consumer IDs
-- ============================================================
INSERT INTO service_requests (request_id, consumer_id, request_type, description, status) VALUES
('REQ1001', '1234567890123', 'LOAD_CHANGE', 'Increase load to 4.0 kW', 'PENDING');

-- ============================================================
-- Notifications
-- Matches: Customer.addNotification() calls in loadDummyData()
-- Updated to use 13-digit consumer IDs
-- ============================================================
INSERT INTO notifications (consumer_id, message) VALUES
('1234567890123', 'Welcome to Electricity Board.');

-- ============================================================
-- Login Table
-- Added per sheet requirements for authentication
-- ============================================================
INSERT INTO login (email, user_id, password, user_type, status) VALUES
('admin', 'admin', 'admin123', 'Admin', 'Active'),
('amit@test.com', 'amit123', 'pass123', 'Customer', 'Active'),
('priya@test.com', 'priya123', 'pass123', 'Customer', 'Active');
