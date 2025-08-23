-- Migration script to increase activity_logs description column length
-- This fixes the "column value too long" error when creating activity logs

-- Modify the description column to allow up to 1000 characters
ALTER TABLE `activity_logs`
MODIFY COLUMN `description` VARCHAR(1000) NULL;

-- Verify the change
DESCRIBE `activity_logs`;
