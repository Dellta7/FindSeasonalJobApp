const SELECT_COLUMNS = `
  id,
  userId,
  title,
  companyName,
  location,
  category,
  salaryText,
  workTimeText,
  description,
  contactPhone,
  status,
  createdAt
`;

export async function getAllJobs(pool) {
  const [rows] = await pool.query(
    `SELECT ${SELECT_COLUMNS} FROM jobs ORDER BY id DESC;`
  );
  return rows;
}

export async function searchJobsByTitle(pool, titleQuery) {
  const q = String(titleQuery ?? '').trim();
  if (!q) return await getAllJobs(pool);

  const [rows] = await pool.query(
    `SELECT ${SELECT_COLUMNS} FROM jobs WHERE title LIKE ? ORDER BY id DESC;`,
    [`%${q}%`]
  );
  return rows;
}

export async function getJobById(pool, id) {
  const [rows] = await pool.query(
    `SELECT ${SELECT_COLUMNS} FROM jobs WHERE id = ? LIMIT 1;`,
    [id]
  );
  return rows[0] ?? null;
}

export async function createJob(pool, job) {
  const [result] = await pool.query(
    `
    INSERT INTO jobs (
      userId,
      title,
      companyName,
      location,
      category,
      salaryText,
      workTimeText,
      description,
      contactPhone,
      status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `,
    [
      job.userId ?? null,
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

  return await getJobById(pool, result.insertId);
}

export async function updateJob(pool, id, nextJob) {
  const [result] = await pool.query(
    `
    UPDATE jobs
    SET
      title = ?,
      companyName = ?,
      location = ?,
      category = ?,
      salaryText = ?,
      workTimeText = ?,
      description = ?,
      contactPhone = ?,
      status = ?
    WHERE id = ?;
    `,
    [
      nextJob.title,
      nextJob.companyName,
      nextJob.location,
      nextJob.category,
      nextJob.salaryText ?? null,
      nextJob.workTimeText ?? null,
      nextJob.description ?? null,
      nextJob.contactPhone ?? null,
      nextJob.status ?? 'open',
      id,
    ]
  );

  if (result.affectedRows === 0) return null;
  return await getJobById(pool, id);
}

export async function deleteJob(pool, id) {
  const [result] = await pool.query(`DELETE FROM jobs WHERE id = ?;`, [id]);
  return result.affectedRows > 0;
}

export async function canUserModifyJob(pool, jobId, userId, userRole) {
  // Admin can modify any job
  if (userRole === 'admin') return true;

  // Regular users can only modify their own jobs
  const job = await getJobById(pool, jobId);
  if (!job) return false;

  return job.userId === userId;
}
