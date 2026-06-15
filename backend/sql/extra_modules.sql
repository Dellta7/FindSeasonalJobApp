-- Add Favorites and Categories tables
USE `findseasonaljobs`;

CREATE TABLE IF NOT EXISTS categories (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS favorites (
  id INT NOT NULL AUTO_INCREMENT,
  userId INT NOT NULL,
  jobId INT NOT NULL,
  note TEXT NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY unique_user_job (userId, jobId),
  CONSTRAINT fk_favorites_users FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_favorites_jobs FOREIGN KEY (jobId) REFERENCES jobs (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed categories
INSERT INTO categories (name, description)
SELECT * FROM (
  SELECT 'F&B' AS name, 'Food and Beverage services' AS description
  UNION ALL
  SELECT 'Bán lẻ', 'Retail and shop assistance'
  UNION ALL
  SELECT 'Kho vận', 'Warehouse and logistics'
  UNION ALL
  SELECT 'Giao hàng', 'Delivery services'
  UNION ALL
  SELECT 'Văn phòng', 'Office and administrative tasks'
) AS cat_seed
WHERE NOT EXISTS (SELECT 1 FROM categories);
