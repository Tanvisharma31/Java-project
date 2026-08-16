USE electricity_bill_db;

-- ============================================================
-- TARIFF CONFIGURATION
-- ============================================================
INSERT IGNORE INTO tariff_config (connection_type, fixed_charge_per_kw, slab1_rate, slab2_rate, slab3_rate, electricity_duty_pct)
VALUES
  ('RESIDENTIAL', 50.00,  3.50,  5.00,  7.00,  0.0500),
  ('COMMERCIAL',  75.00,  5.50,  7.50, 10.00,  0.0750);

-- ============================================================
-- ADMIN ACCOUNT  (password: Admin@123)
-- BCrypt hash generated with strength 10
-- ============================================================
INSERT IGNORE INTO admins (username, password)
VALUES ('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy');

-- ============================================================
-- STAFF ACCOUNTS  (password for all: Staff@123)
-- ============================================================
INSERT IGNORE INTO staff (staff_id, name, password, area_assigned, status) VALUES
  ('STF101', 'Ramesh Kumar',  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'North Delhi', 'Active'),
  ('STF102', 'Suresh Mehta',  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'South Delhi', 'Active'),
  ('STF103', 'Anita Singh',   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'East Delhi',  'Active'),
  ('STF104', 'Vikram Bose',   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'West Delhi',  'Inactive');

-- ============================================================
-- CUSTOMER ACCOUNTS  (password for all: Vidyut@123)
-- ============================================================
INSERT IGNORE INTO customers
  (consumer_id, name, email, mobile, password, title, user_id, status, address_area, city, pincode, connection_type, sanctioned_load_kw, previous_meter_reading)
VALUES
  ('1000987654321', 'Tanvi Sharma',   'tanvi@example.com',   '9876543210',
   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
   'Ms', 'tanvi_2004', 'Active', 'North Delhi', 'Delhi', '110001', 'RESIDENTIAL', 3.50, 4250),

  ('2000123456789', 'Ramesh Patel',   'ramesh@example.com',  '9823456710',
   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
   'Mr', 'ramesh_p',   'Active', 'South Delhi', 'Delhi', '110062', 'RESIDENTIAL', 5.00, 6820),

  ('3000987612345', 'Priya Nair',     'priya@example.com',   '9812345670',
   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
   'Ms', 'priya_nair', 'Active', 'East Delhi',  'Delhi', '110091', 'COMMERCIAL',  10.00, 12050),

  ('4000456789012', 'Arjun Mehta',    'arjun@example.com',   '9834567890',
   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
   'Mr', 'arjun_m',    'Inactive', 'West Delhi', 'Delhi', '110045', 'RESIDENTIAL', 2.00, 3100);

-- ============================================================
-- BILLS (demo data)
-- ============================================================
INSERT IGNORE INTO bills
  (bill_id, consumer_id, previous_reading, current_reading, units_consumed, amount, late_fee, total_payable, billing_month, bill_date, due_date, status)
VALUES
  ('BILL-JUL-2026-001', '1000987654321', 4000, 4250, 250, 1811.25, 0.00, 1811.25, '2026-07', '2026-07-01', '2026-07-16', 'PAID'),
  ('BILL-AUG-2026-001', '1000987654321', 4250, 4250, 0,   375.00,  0.00,  375.00,  '2026-08', '2026-08-01', '2026-08-16', 'PENDING'),
  ('BILL-JUN-2026-002', '2000123456789', 6600, 6820, 220, 1635.00, 0.00, 1635.00,  '2026-06', '2026-06-01', '2026-06-16', 'OVERDUE'),
  ('BILL-JUL-2026-003', '3000987612345', 12000,12050, 50, 1437.50,0.00, 1437.50,  '2026-07', '2026-07-01', '2026-07-16', 'PAID');

-- ============================================================
-- PAYMENTS (demo data)
-- ============================================================
INSERT IGNORE INTO payments
  (transaction_id, receipt_number, consumer_id, bill_ids, total_paid, payment_method, masked_card, payment_date, status)
VALUES
  ('TXN-DEMO-001', 'RCP-1001', '1000987654321', 'BILL-JUL-2026-001', 1811.25, 'CARD',        '****-****-****-1111', '2026-07-05 14:23:00', 'SUCCESS'),
  ('TXN-DEMO-002', 'RCP-1002', '3000987612345', 'BILL-JUL-2026-003', 1437.50, 'UPI',         NULL,                  '2026-07-08 09:11:00', 'SUCCESS');

-- ============================================================
-- COMPLAINTS (demo data)
-- ============================================================
INSERT IGNORE INTO complaints
  (complaint_id, consumer_id, customer_name, complaint_type, category, assigned_area, description, priority, status, created_at)
VALUES
  ('CMP-2026-000001', '1000987654321', 'Tanvi Sharma',  'Billing Related',   'Wrong Bill Amount',     'North Delhi', 'Bill amount seems higher than usual. Please verify meter reading.', 'MEDIUM', 'OPEN',       NOW()),
  ('CMP-2026-000002', '2000123456789', 'Ramesh Patel',  'Voltage Related',   'High Voltage Fluctuation','South Delhi','Frequent high voltage surges damaging appliances.', 'HIGH', 'IN_PROGRESS', NOW()),
  ('CMP-2026-000003', '3000987612345', 'Priya Nair',    'Meter Related',     'Faulty Meter Display',  'East Delhi',  'Meter display shows incorrect reading.', 'MEDIUM', 'RESOLVED',    NOW());

-- ============================================================
-- SERVICE REQUESTS (demo data)
-- ============================================================
INSERT IGNORE INTO service_requests
  (request_id, consumer_id, customer_name, request_type, current_value, requested_value, reason, status, created_at)
VALUES
  ('SR-2026-000001', '1000987654321', 'Tanvi Sharma', 'LOAD_CHANGE',    '3.5 kW', '5.0',          'Added new AC unit and washing machine. Need higher load.', 'PENDING',  NOW()),
  ('SR-2026-000002', '2000123456789', 'Ramesh Patel',  'CATEGORY_CHANGE','RESIDENTIAL','COMMERCIAL','Started a small business from home requiring commercial tariff.', 'APPROVED', NOW());

-- ============================================================
-- NOTIFICATIONS (demo data)
-- ============================================================
INSERT IGNORE INTO notifications (consumer_id, message, is_read, created_at) VALUES
  ('1000987654321', 'Your August electricity bill has been generated. Amount: ₹375.00. Due: 2026-08-16', 0, NOW()),
  ('1000987654321', 'Payment successful for July bill. Transaction ID: TXN-DEMO-001. Amount: ₹1811.25',  1, NOW() - INTERVAL 15 DAY),
  ('1000987654321', 'Your load change service request SR-2026-000001 is under review.',                   0, NOW()),
  ('2000123456789', 'Your complaint CMP-2026-000002 is now IN_PROGRESS. Our team is working on it.',     0, NOW()),
  ('2000123456789', 'Category change request SR-2026-000002 has been APPROVED.',                         0, NOW());
