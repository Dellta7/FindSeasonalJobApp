export async function getFavoritesByUserId(pool, userId) {
  const [rows] = await pool.query(
    `SELECT f.id as favoriteId, f.userId, f.jobId, f.note, f.createdAt as favoriteCreatedAt,
            j.* 
     FROM favorites f 
     JOIN jobs j ON f.jobId = j.id 
     WHERE f.userId = ? 
     ORDER BY f.createdAt DESC`,
    [userId]
  );
  return rows;
}

export async function getFavoriteById(pool, id) {
  const [rows] = await pool.query('SELECT * FROM favorites WHERE id = ?', [id]);
  return rows[0] ?? null;
}

export async function addFavorite(pool, userId, jobId, note) {
  const [result] = await pool.query(
    'INSERT INTO favorites (userId, jobId, note) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE note = ?',
    [userId, jobId, note ?? null, note ?? null]
  );
  return await getFavoriteById(pool, result.insertId || (await findFavoriteId(pool, userId, jobId)));
}

async function findFavoriteId(pool, userId, jobId) {
  const [rows] = await pool.query('SELECT id FROM favorites WHERE userId = ? AND jobId = ?', [userId, jobId]);
  return rows[0]?.id;
}

export async function updateFavoriteNote(pool, id, note) {
  await pool.query('UPDATE favorites SET note = ? WHERE id = ?', [note, id]);
  return await getFavoriteById(pool, id);
}

export async function removeFavorite(pool, id) {
  const [result] = await pool.query('DELETE FROM favorites WHERE id = ?', [id]);
  return result.affectedRows > 0;
}
