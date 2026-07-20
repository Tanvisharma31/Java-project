-- ============================================================
-- ELECTRICITY BILL MANAGEMENT SYSTEM - DATABASE SCHEMA
-- ============================================================
-- Derived from Java Models: Customer, Staff, Bill, Complaint,
-- ServiceRequest, TariffConfig
-- ============================================================

CREATE DATABASE IF NOT EXISTS electricity_bill_db;
USE electricity_bill_db;

-- ============================================================
-- TABLE: tariff_config
-- Stores all billing rate slabs and fixed charges.
-- Mirrors: TariffConfig.java
-- ============================================================
CREATE TABLE IF NOT EXISTS tariff_config (
    id                      INT PRIMARY KEY AUTO_INCREMENT,
    connection_type         ENUM('RESIDENTIAL', 'COMMERCIAL') NOT NULL,
    fixed_charge_per_kw     DECIMAL(10, 2) NOT NULL,
    slab1_rate              DECIMAL(10, 2) NOT NULL COMMENT '0-100 units rate',
    slab2_rate              DECIMAL(10, 2) NOT NULL COMMENT '101-300 units rate',
    slab3_rate              DECIMAL(10, 2) NOT NULL COMMENT '301+ units rate',
    electricity_duty_pct    DECIMAL(5, 4)  NOT NULL DEFAULT 0.0500 COMMENT '5% tax',
    updated_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_connection_type (connection_type)
);

-- ============================================================
-- TABLE: admins
-- Stores admin credentials. Only one admin in the system.
-- ============================================================
CREATE TABLE IF NOT EXISTS admins (
    id          INT PRIMARY KEY AUTO_INCREMENT,
    username    VARCHAR(50)  NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLE: staff
-- Stores staff (meter reader) information.
-- Mirrors: Staff.java
-- ============================================================
CREATE TABLE IF NOT EXISTS staff (
    staff_id        VARCHAR(20)  PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    password        VARCHAR(255) NOT NULL,
    area_assigned   VARCHAR(100) NOT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLE: customers
-- Stores registered customer details.
-- Mirrors: Customer.java
-- Updated per sheet requirements: 13-digit consumer ID, title, user_id, status
-- ============================================================
CREATE TABLE IF NOT EXISTS customers (
    consumer_id             VARCHAR(13)  PRIMARY KEY,
    name                    VARCHAR(50)  NOT NULL,
    email                   VARCHAR(100) NOT NULL,
    mobile                  VARCHAR(15)  NOT NULL,
    password                VARCHAR(30)  NOT NULL,
    title                   ENUM('Mr', 'Mrs', 'Ms', 'Dr') NOT NULL,
    user_id                 VARCHAR(20)  NOT NULL,
    status                  ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
    address_area            VARCHAR(100) NOT NULL,
    connection_type         ENUM('RESIDENTIAL', 'COMMERCIAL') NOT NULL,
    sanctioned_load_kw      DECIMAL(6, 2) NOT NULL,
    previous_meter_reading  INT NOT NULL DEFAULT 0,
    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_email  (email),
    UNIQUE KEY uq_mobile (mobile),
    UNIQUE KEY uq_user_id (user_id),
    CONSTRAINT chk_consumer_id CHECK (consumer_id REGEXP '^[0-9]{13}$'),
    CONSTRAINT chk_name CHECK (name REGEXP '^[A-Za-z ]{2,50}$'),
    CONSTRAINT chk_email CHECK (email REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'),
    CONSTRAINT chk_mobile CHECK (mobile REGEXP '^[0-9]{10}$'),
    CONSTRAINT chk_user_id CHECK (user_id REGEXP '^[A-Za-z0-9]{5,20}$'),
    CONSTRAINT chk_password CHECK (password REGEXP '^(?=.*\\d).{6,30}$'),
    CONSTRAINT chk_load CHECK (sanctioned_load_kw > 0)
);

-- ============================================================
-- TABLE: bills
-- Stores generated electricity bills.
-- Mirrors: Bill.java
-- ============================================================
CREATE TABLE IF NOT EXISTS bills (
    bill_id             VARCHAR(20)   PRIMARY KEY,
    consumer_id         VARCHAR(20)   NOT NULL,
    previous_reading    INT           NOT NULL,
    current_reading     INT           NOT NULL,
    units_consumed      INT           NOT NULL,
    amount              DECIMAL(12, 2) NOT NULL COMMENT 'Base bill before late fee',
    late_fee            DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    total_payable       DECIMAL(12, 2) NOT NULL,
    bill_date           DATE          NOT NULL,
    due_date            DATE          NOT NULL,
    status              ENUM('PENDING', 'PAID') NOT NULL DEFAULT 'PENDING',
    payment_method      ENUM('CARD', 'UPI', 'NET_BANKING', 'N/A') NOT NULL DEFAULT 'N/A',
    payment_date        DATE          DEFAULT NULL,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_bill_customer FOREIGN KEY (consumer_id) REFERENCES customers(consumer_id) ON DELETE CASCADE,
    CONSTRAINT chk_reading CHECK (current_reading >= previous_reading),
    CONSTRAINT chk_units   CHECK (units_consumed >= 0)
);

-- ============================================================
-- TABLE: complaints
-- Stores customer-raised complaints.
-- Mirrors: Complaint.java
-- ============================================================
CREATE TABLE IF NOT EXISTS complaints (
    complaint_id    VARCHAR(20)  PRIMARY KEY,
    consumer_id     VARCHAR(20)  NOT NULL,
    description     TEXT         NOT NULL,
    priority        ENUM('LOW', 'MEDIUM', 'HIGH') NOT NULL DEFAULT 'LOW',
    status          ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED') NOT NULL DEFAULT 'OPEN',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at     TIMESTAMP DEFAULT NULL,
    CONSTRAINT fk_complaint_customer FOREIGN KEY (consumer_id) REFERENCES customers(consumer_id) ON DELETE CASCADE
);

-- ============================================================
-- TABLE: service_requests
-- Stores load/category change requests from customers.
-- Mirrors: ServiceRequest.java
-- ============================================================
CREATE TABLE IF NOT EXISTS service_requests (
    request_id      VARCHAR(20)  PRIMARY KEY,
    consumer_id     VARCHAR(20)  NOT NULL,
    request_type    ENUM('LOAD_CHANGE', 'CATEGORY_CHANGE', 'NEW_CONNECTION') NOT NULL,
    description     TEXT         NOT NULL,
    status          ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actioned_at     TIMESTAMP DEFAULT NULL,
    CONSTRAINT fk_request_customer FOREIGN KEY (consumer_id) REFERENCES customers(consumer_id) ON DELETE CASCADE
);

-- ============================================================
-- TABLE: notifications
-- Stores per-customer notification messages.
-- Mirrors: Customer.notifications[] array logic
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
    notification_id INT          PRIMARY KEY AUTO_INCREMENT,
    consumer_id     VARCHAR(13)  NOT NULL,
    message         TEXT         NOT NULL,
    is_read         TINYINT(1)   NOT NULL DEFAULT 0,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notif_customer FOREIGN KEY (consumer_id) REFERENCES customers(consumer_id) ON DELETE CASCADE
);

-- ============================================================
-- TABLE: login
-- Stores login credentials for authentication.
-- Added per sheet requirements for email uniqueness and user management
-- ============================================================
CREATE TABLE IF NOT EXISTS login (
    id          INT PRIMARY KEY AUTO_INCREMENT,
    email       VARCHAR(100) UNIQUE NOT NULL,
    user_id     VARCHAR(20) UNIQUE,
    password    VARCHAR(30) NOT NULL,
    user_type   ENUM('Admin', 'Customer') NOT NULL,
    status      ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX idx_bill_consumer ON bills(consumer_id);
CREATE INDEX idx_bill_status   ON bills(status);
CREATE INDEX idx_complaint_consumer ON complaints(consumer_id);
CREATE INDEX idx_complaint_status   ON complaints(status);
CREATE INDEX idx_request_consumer   ON service_requests(consumer_id);
CREATE INDEX idx_request_status     ON service_requests(status);
CREATE INDEX idx_notif_consumer     ON notifications(consumer_id);
