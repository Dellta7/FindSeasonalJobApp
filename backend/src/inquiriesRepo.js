const SELECT_COLUMNS = `
  id,
  jobId,
  userId,
  fullName,
  phone,
  note,
  status,
  createdAt
`;

export async function getAllInquiries(pool) {
  const [rows] = await pool.query(
    `SELECT ${SELECT_COLUMNS} FROM job_inquiries ORDER BY id DESC;`
  );
  return rows;
}

export async function getInquiryById(pool, id) {
  const [rows] = await pool.query(
    `SELECT ${SELECT_COLUMNS} FROM job_inquiries WHERE id = ? LIMIT 1;`,
    [id]
  );
  return rows[0] ?? null;
}

export async function getInquiriesByJobId(pool, jobId) {
  const [rows] = await pool.query(
    `SELECT ${SELECT_COLUMNS} FROM job_inquiries WHERE jobId = ? ORDER BY id DESC;`,
    [jobId]
  );
  return rows;
}

export async function createInquiry(pool, inquiry) {
  const [result] = await pool.query(
    `
    INSERT INTO job_inquiries (
      jobId,
      userId,
      fullName,
      phone,
      note,
      status
    ) VALUES (?, ?, ?, ?, ?, ?);
    `,
    [
      inquiry.jobId,
      inquiry.userId ?? null,
      inquiry.fullName,
      inquiry.phone,
      inquiry.note ?? null,
      inquiry.status ?? 'pending'
    ]
  );

  return await getInquiryById(pool, result.insertId);
}

export async function updateInquiry(pool, id, nextInquiry) {
  const [result] = await pool.query(
    `
    UPDATE job_inquiries
    SET
      jobId = ?,
      userId = ?,
      fullName = ?,
      phone = ?,
      note = ?,
      status = ?
    WHERE id = ?;
    `,
    [
      nextInquiry.jobId,
      nextInquiry.userId ?? null,
      nextInquiry.fullName,
      nextInquiry.phone,
      nextInquiry.note ?? null,
      nextInquiry.status ?? 'pending',
      id,
    ]
  );

  if (result.affectedRows === 0) return null;
  return await getInquiryById(pool, id);
}

export async function deleteInquiry(pool, id) {
  const [result] = await pool.query(
    `DELETE FROM job_inquiries WHERE id = ?;`,
    [id]
  );
  return result.affectedRows > 0;
}

export async function getInquiriesByUserId(pool, userId) {
  const [rows] = await pool.query(
    `
    SELECT i.*, j.title AS jobTitle
    FROM job_inquiries i
    JOIN jobs j ON i.jobId = j.id
    WHERE j.userId = ?
    ORDER BY i.createdAt DESC;
    `,
    [userId]
  );
  return rows;
}

export async function getInquiriesByApplicantId(pool, applicantId) {
  const [rows] = await pool.query(
    `
    SELECT i.*, j.title AS jobTitle, j.companyName
    FROM job_inquiries i
    JOIN jobs j ON i.jobId = j.id
    WHERE i.userId = ?
    ORDER BY i.createdAt DESC;
    `,
    [applicantId]
  );
  return rows;
}
