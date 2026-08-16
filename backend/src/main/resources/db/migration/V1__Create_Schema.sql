-- ============================================================
-- VIDYUTSEVA - FULL SCHEMA v1
-- Flyway Migration: Initial Schema Creation
-- ============================================================

-- Users (login table, unified across roles)
CREATE TABLE IF NOT EXISTS login (
    id          BIGINT PRIMARY KEY AUTO_INCREMENT,
    email       VARCHAR(100) UNIQUE NOT NULL,
    user_id     VARCHAR(20) UNIQUE,
    password    VARCHAR(255) NOT NULL,
    user_type   ENUM('Admin', 'Customer', 'Staff') NOT NULL,
    status      ENUM('Active', 'Inactive', 'Deactivated') NOT NULL DEFAULT 'Active',
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Staff / Meter Readers
CREATE TABLE IF NOT EXISTS staff (
    staff_id        VARCHAR(20)  PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    password        VARCHAR(255) NOT NULL,
    area_assigned   VARCHAR(100) NOT NULL,
    status          VARCHAR(20)  NOT NULL DEFAULT 'Active',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tariff Configuration (per connection type)
CREATE TABLE IF NOT EXISTS tariff_config (
    id                      BIGINT PRIMARY KEY AUTO_INCREMENT,
    connection_type         VARCHAR(20)    NOT NULL UNIQUE,
    fixed_charge_per_kw     DECIMAL(10,2)  NOT NULL,
    slab1_rate              DECIMAL(10,2)  NOT NULL COMMENT '0-100 units',
    slab2_rate              DECIMAL(10,2)  NOT NULL COMMENT '101-300 units',
    slab3_rate              DECIMAL(10,2)  NOT NULL COMMENT '301+ units',
    electricity_duty_pct    DECIMAL(5,4)   NOT NULL DEFAULT 0.0500,
    updated_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Customers
CREATE TABLE IF NOT EXISTS customers (
    consumer_id             VARCHAR(13)   PRIMARY KEY,
    name                    VARCHAR(50)   NOT NULL,
    email                   VARCHAR(100)  NOT NULL,
    mobile                  VARCHAR(15)   NOT NULL,
    password                VARCHAR(255)  NOT NULL,
    title                   VARCHAR(10)   NOT NULL,
    user_id                 VARCHAR(20)   NOT NULL,
    status                  VARCHAR(20)   NOT NULL DEFAULT 'Active',
    address_area            VARCHAR(100)  NOT NULL,
    city                    VARCHAR(100),
    pincode                 VARCHAR(10),
    connection_type         VARCHAR(20)   NOT NULL DEFAULT 'RESIDENTIAL',
    sanctioned_load_kw      DECIMAL(6,2)  NOT NULL DEFAULT 3.00,
    previous_meter_reading  INT           NOT NULL DEFAULT 0,
    deactivation_reason     TEXT,
    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_customer_user   FOREIGN KEY (user_id) REFERENCES login(user_id) ON DELETE CASCADE,
    CONSTRAINT chk_consumer_id   CHECK (consumer_id REGEXP '^[0-9]{13}$'),
    CONSTRAINT chk_mobile        CHECK (mobile REGEXP '^[0-9]{10}$'),
    CONSTRAINT chk_load_positive CHECK (sanctioned_load_kw > 0),
    UNIQUE KEY uq_user_consumer (user_id, consumer_id)
);

-- Bills
CREATE TABLE IF NOT EXISTS bills (
    bill_id                 VARCHAR(30)   PRIMARY KEY,
    consumer_id             VARCHAR(13)   NOT NULL,
    previous_reading        INT           NOT NULL,
    current_reading         INT           NOT NULL,
    units_consumed          INT           NOT NULL,
    amount                  DECIMAL(12,2) NOT NULL,
    late_fee                DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    total_payable           DECIMAL(12,2) NOT NULL,
    billing_month           VARCHAR(20),
    bill_date               DATE          NOT NULL,
    due_date                DATE          NOT NULL,
    status                  VARCHAR(20)   NOT NULL DEFAULT 'PENDING',
    payment_method          VARCHAR(20)            DEFAULT 'N/A',
    payment_date            DATE,
    is_overdue_15_days      TINYINT(1)    NOT NULL DEFAULT 0,
    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_bill_consumer   FOREIGN KEY (consumer_id) REFERENCES customers(consumer_id),
    CONSTRAINT chk_reading_valid  CHECK (current_reading >= previous_reading),
    CONSTRAINT chk_units_valid    CHECK (units_consumed >= 0),
    UNIQUE KEY uq_bill_month (consumer_id, billing_month)
);

-- Payments (never store full card or CVV)
CREATE TABLE IF NOT EXISTS payments (
    transaction_id  VARCHAR(30)   PRIMARY KEY,
    receipt_number  VARCHAR(30)   UNIQUE NOT NULL,
    consumer_id     VARCHAR(13)   NOT NULL,
    bill_ids        VARCHAR(255)  NOT NULL,
    total_paid      DECIMAL(12,2) NOT NULL,
    payment_method  VARCHAR(20)   NOT NULL,
    masked_card     VARCHAR(25),
    payment_date    DATETIME      NOT NULL,
    status          VARCHAR(20)   NOT NULL DEFAULT 'SUCCESS',
    CONSTRAINT fk_payment_consumer FOREIGN KEY (consumer_id) REFERENCES customers(consumer_id)
);

-- Complaints
CREATE TABLE IF NOT EXISTS complaints (
    complaint_id        VARCHAR(25)  PRIMARY KEY,
    consumer_id         VARCHAR(13)  NOT NULL,
    customer_name       VARCHAR(100),
    complaint_type      VARCHAR(60)  NOT NULL,
    category            VARCHAR(60)  NOT NULL,
    assigned_area       VARCHAR(100),
    description         TEXT         NOT NULL,
    priority            VARCHAR(10)  NOT NULL DEFAULT 'LOW',
    status              VARCHAR(20)  NOT NULL DEFAULT 'OPEN',
    resolution_remarks  TEXT,
    created_at          DATETIME,
    resolved_at         DATETIME,
    CONSTRAINT fk_complaint_consumer FOREIGN KEY (consumer_id) REFERENCES customers(consumer_id)
);

-- Service Requests
CREATE TABLE IF NOT EXISTS service_requests (
    request_id      VARCHAR(25)  PRIMARY KEY,
    consumer_id     VARCHAR(13)  NOT NULL,
    customer_name   VARCHAR(100),
    request_type    VARCHAR(50)  NOT NULL,
    current_value   VARCHAR(50),
    requested_value VARCHAR(50)  NOT NULL,
    reason          TEXT         NOT NULL,
    status          VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
    remarks         TEXT,
    created_at      DATETIME,
    actioned_at     DATETIME,
    CONSTRAINT fk_sr_consumer FOREIGN KEY (consumer_id) REFERENCES customers(consumer_id)
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    notification_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    consumer_id     VARCHAR(13)  NOT NULL,
    message         TEXT         NOT NULL,
    is_read         TINYINT(1)   NOT NULL DEFAULT 0,
    created_at      DATETIME,
    CONSTRAINT fk_notif_consumer FOREIGN KEY (consumer_id) REFERENCES customers(consumer_id)
);

-- Admins (simple credentials)
CREATE TABLE IF NOT EXISTS admins (
    id          BIGINT PRIMARY KEY AUTO_INCREMENT,
    username    VARCHAR(50)  UNIQUE NOT NULL,
    password    VARCHAR(255) NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Feedback System
CREATE TABLE IF NOT EXISTS feedback (
    feedback_id      BIGINT PRIMARY KEY AUTO_INCREMENT,
    feedback_number  VARCHAR(20)  UNIQUE NOT NULL,
    consumer_id      VARCHAR(13),
    staff_id         VARCHAR(20),
    type             VARCHAR(50)  NOT NULL,
    category         VARCHAR(50)  NOT NULL,
    subject          VARCHAR(100) NOT NULL,
    details          TEXT         NOT NULL,
    rating           INT          NOT NULL CHECK (rating BETWEEN 1 AND 5),
    contact_info     VARCHAR(255),
    status           ENUM('SUBMITTED', 'UNDER_REVIEW', 'ACKNOWLEDGED', 'RESOLVED') NOT NULL DEFAULT 'SUBMITTED',
    admin_response   TEXT,
    admin_id         BIGINT,
    responded_at     DATETIME,
    created_at      DATETIME     DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_feedback_consumer FOREIGN KEY (consumer_id) REFERENCES customers(consumer_id),
    CONSTRAINT fk_feedback_staff    FOREIGN KEY (staff_id) REFERENCES staff(staff_id),
    CONSTRAINT fk_feedback_admin    FOREIGN KEY (admin_id) REFERENCES admins(id)
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_bills_consumer       ON bills(consumer_id);
CREATE INDEX idx_bills_status         ON bills(status);
CREATE INDEX idx_payments_consumer    ON payments(consumer_id);
CREATE INDEX idx_complaints_consumer  ON complaints(consumer_id);
CREATE INDEX idx_complaints_area      ON complaints(assigned_area);
CREATE INDEX idx_sr_consumer          ON service_requests(consumer_id);
CREATE INDEX idx_notif_consumer       ON notifications(consumer_id);
CREATE INDEX idx_feedback_consumer    ON feedback(consumer_id);
CREATE INDEX idx_feedback_status      ON feedback(status);