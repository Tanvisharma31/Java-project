-- ============================================================
-- VIDYUTSEVA - Migration V3
-- Drop foreign key constraint from customers table
-- Reason: Registration only saves to customers table, not login table
-- ============================================================

ALTER TABLE customers DROP FOREIGN KEY fk_customer_user;
