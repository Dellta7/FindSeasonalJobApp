import mysql from 'mysql2/promise';

export async function createDbPool({ host, port, user, password, database }) {
  const adminConnection = await mysql.createConnection({
    host,
    port,
    user,
    password,
  });

  try {
    try {
      await adminConnection.query(
        `CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
      );
    } catch (err) {
      // CREATE DATABASE requires privileges even with IF NOT EXISTS.
      // If the DB already exists and the user lacks CREATE, continue and let the next step decide.
      const code = err?.code;
      if (
        code !== 'ER_ACCESS_DENIED_ERROR' &&
        code !== 'ER_DBACCESS_DENIED_ERROR' &&
        code !== 'ER_SPECIFIC_ACCESS_DENIED_ERROR'
      ) {
        throw err;
      }
    }
  } finally {
    await adminConnection.end();
  }

  const pool = mysql.createPool({
    host,
    port,
    user,
    password,
    database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS jobs (
      id INT NOT NULL AUTO_INCREMENT,
      title VARCHAR(255) NOT NULL,
      companyName VARCHAR(255) NOT NULL,
      location VARCHAR(255) NOT NULL,
      category VARCHAR(100) NOT NULL,
      salaryText VARCHAR(100) NULL,
      workTimeText VARCHAR(200) NULL,
      description TEXT NULL,
      contactPhone VARCHAR(50) NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'open',
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS job_inquiries (
      id INT NOT NULL AUTO_INCREMENT,
      jobId INT NOT NULL,
      userId INT NULL,
      fullName VARCHAR(255) NOT NULL,
      phone VARCHAR(50) NOT NULL,
      note TEXT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'pending',
      createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      INDEX idx_jobId (jobId),
      INDEX idx_userId (userId),
      CONSTRAINT fk_job_inquiries_jobs
        FOREIGN KEY (jobId) REFERENCES jobs (id)
        ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // Migration: Add status and userId columns to job_inquiries if they don't exist
  try {
    const [columns] = await pool.query(`SHOW COLUMNS FROM job_inquiries;`);
    const columnNames = columns.map(c => c.Field);
    
    if (!columnNames.includes('status')) {
      await pool.execute(`ALTER TABLE job_inquiries ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'pending' AFTER note;`);
      console.log('✅ Added status column to job_inquiries table.');
    }
    
    if (!columnNames.includes('userId')) {
      await pool.execute(`ALTER TABLE job_inquiries ADD COLUMN userId INT NULL AFTER jobId;`);
      await pool.execute(`CREATE INDEX idx_userId ON job_inquiries(userId);`);
      console.log('✅ Added userId column to job_inquiries table.');
    }
  } catch (err) {
    console.warn('⚠️ Could not check/add columns to job_inquiries:', err.message);
  }

  // Seed sample data (only if table is empty)
  const [countRows] = await pool.query('SELECT COUNT(*) AS count FROM jobs;');
  const count = Number(countRows?.[0]?.count ?? 0);

  if (count === 0) {
    const seeds = [
      {
        title: 'Phục vụ quán cà phê (part-time)',
        companyName: 'Cafe Mộc',
        location: 'Q.1, TP.HCM',
        category: 'F&B',
        salaryText: '25k/giờ',
        workTimeText: '17:00 - 22:00 (T2-T6)',
        description:
          'Cần 2 bạn phục vụ ca tối. Yêu cầu nhanh nhẹn, giao tiếp cơ bản. Có hỗ trợ ăn nhẹ.',
        contactPhone: '0900 000 001',
        status: 'open',
      },
      {
        title: 'Nhân viên bán hàng cuối tuần',
        companyName: 'MiniMart 24H',
        location: 'Thủ Đức, TP.HCM',
        category: 'Bán lẻ',
        salaryText: '200k/ca',
        workTimeText: '08:00 - 16:00 (T7-CN)',
        description:
          'Hỗ trợ bán hàng, sắp xếp kệ. Ưu tiên bạn có thể đi làm ngay. Có training 1 buổi.',
        contactPhone: '0900 000 002',
        status: 'open',
      },
      {
        title: 'Phụ kho thời vụ',
        companyName: 'Kho Vận An Tâm',
        location: 'Dĩ An, Bình Dương',
        category: 'Kho vận',
        salaryText: '350k/ngày',
        workTimeText: '08:00 - 17:00 (3 tuần)',
        description:
          'Bốc xếp nhẹ, phân loại hàng. Yêu cầu sức khoẻ tốt. Có phụ cấp cơm trưa.',
        contactPhone: '0900 000 003',
        status: 'open',
      },
    ];

    for (const job of seeds) {
      await pool.query(
        `
        INSERT INTO jobs (
          title,
          companyName,
          location,
          category,
          salaryText,
          workTimeText,
          description,
          contactPhone,
          status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
        `,
        [
          job.title,
          job.companyName,
          job.location,
          job.category,
          job.salaryText ?? null,
          job.workTimeText ?? null,
          job.description ?? null,
          job.contactPhone ?? null,
          job.status ?? 'open',
        ]
      );
    }
    console.log(`🌱 Seeded ${seeds.length} sample jobs into MySQL (${database}).`);
  }

  return pool;
}
