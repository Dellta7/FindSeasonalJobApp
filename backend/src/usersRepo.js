export async function getUserByEmail(pool, email) {
  const [rows] = await pool.query(
    `SELECT id, email, password, fullName, role, phone, address, avatarUrl, createdAt FROM users WHERE email = ? LIMIT 1;`,
    [email]
  );
  return rows[0] ?? null;
}

export async function getAllUsers(pool) {
  const [rows] = await pool.query(
    `SELECT id, email, fullName, role, phone, address, avatarUrl, createdAt FROM users ORDER BY id DESC;`
  );
  return rows;
}

export async function getUserById(pool, id) {
  const [rows] = await pool.query(
    `SELECT id, email, fullName, role, phone, address, avatarUrl, createdAt FROM users WHERE id = ? LIMIT 1;`,
    [id]
  );
  return rows[0] ?? null;
}

export async function updateUser(pool, id, user) {
  await pool.query(
    `
    UPDATE users
    SET email = ?, fullName = ?, phone = ?, address = ?, avatarUrl = ?
    WHERE id = ?;
    `,
    [
      user.email,
      user.fullName,
      user.phone ?? null,
      user.address ?? null,
      user.avatarUrl ?? null,
      id,
    ]
  );

  return await getUserById(pool, id);
}

export async function createUser(pool, user) {
  const [result] = await pool.query(
    `
    INSERT INTO users (email, password, fullName, role)
    VALUES (?, ?, ?, ?);
    `,
    [
      user.email,
      user.password, // Note: In production, hash this with bcrypt!
      user.fullName,
      user.role ?? 'user',
    ]
  );

  return await getUserById(pool, result.insertId);
}

export async function deleteUser(pool, id) {
  const [result] = await pool.query(
    `DELETE FROM users WHERE id = ?;`,
    [id]
  );
  return result.affectedRows > 0;
}

export async function getUserJobsByUserId(pool, userId) {
  const [rows] = await pool.query(
    `
    SELECT 
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
    FROM jobs
    WHERE userId = ?
    ORDER BY createdAt DESC;
    `,
    [userId]
  );
  return rows;
}
