-- Run this once in MySQL (e.g. MySQL Workbench)
CREATE DATABASE IF NOT EXISTS `findseasonaljobs`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `findseasonaljobs`;

CREATE TABLE IF NOT EXISTS users (
  id INT NOT NULL AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  fullName VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user',
  -- New fields for Profile Edit
  phone VARCHAR(50) NULL,
  address TEXT NULL,
  avatarUrl TEXT NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS jobs (
  id INT NOT NULL AUTO_INCREMENT,
  userId INT NULL,
  title VARCHAR(255) NOT NULL,
  companyName VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  salaryText VARCHAR(100) NULL,
  workTimeText VARCHAR(200) NULL,
  description TEXT NULL,
  contactPhone VARCHAR(50) NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'open',
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_userId (userId),
  CONSTRAINT fk_jobs_users
    FOREIGN KEY (userId) REFERENCES users (id)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS job_inquiries (
  id INT NOT NULL AUTO_INCREMENT,
  jobId INT NOT NULL,
  fullName VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  note TEXT NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_jobId (jobId),
  CONSTRAINT fk_job_inquiries_jobs
    FOREIGN KEY (jobId) REFERENCES jobs (id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed admin user
INSERT INTO users (email, password, fullName, role)
SELECT * FROM (
  SELECT
    'admin@admin' AS email,
    '1234' AS password,
    'Administrator' AS fullName,
    'admin' AS role
) AS admin
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@admin');

-- Seed sample data (only if table is empty)
INSERT INTO jobs (userId,
  title,
  companyName,
  location,
  category,
  salaryText,
  workTimeText,
  description,
  contactPhone,
  status
)
SELECT *
FROM (
  SELECT
    NULL AS userId,
    'Phục vụ quán cà phê (part-time)' AS title,
    'Cafe Mộc' AS companyName,
    'Q.1, TP.HCM' AS location,
    'F&B' AS category,
    '25k/giờ' AS salaryText,
    '17:00 - 22:00 (T2-T6)' AS workTimeText,
    'Cần 2 bạn phục vụ ca tối. Yêu cầu nhanh nhẹn, giao tiếp cơ bản. Có hỗ trợ ăn nhẹ.' AS description,
    '0900 000 001' AS contactPhone,
    'open' AS status
  UNION ALL
  SELECT
    NULL,
    'Nhân viên bán hàng cuối tuần',
    'MiniMart 24H',
    'Thủ Đức, TP.HCM',
    'Bán lẻ',
    '200k/ca',
    '08:00 - 16:00 (T7-CN)',
    'Hỗ trợ bán hàng, sắp xếp kệ. Ưu tiên bạn có thể đi làm ngay. Có training 1 buổi.',
    '0900 000 002',
    'open'
  UNION ALL
  SELECT
    NULL,
    'Phụ kho thời vụ',
    'Kho Vận An Tâm',
    'Dĩ An, Bình Dương',
    'Kho vận',
    '350k/ngày',
    '08:00 - 17:00 (3 tuần)',
    'Bốc xếp nhẹ, phân loại hàng. Yêu cầu sức khoẻ tốt. Có phụ cấp cơm trưa.',
    '0900 000 003',
    'open'
) AS seed
WHERE NOT EXISTS (SELECT 1 FROM jobs);
