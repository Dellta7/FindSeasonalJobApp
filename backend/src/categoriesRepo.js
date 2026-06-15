export async function getAllCategories(pool) {
  const [rows] = await pool.query('SELECT * FROM categories ORDER BY name ASC');
  return rows;
}

export async function getCategoryById(pool, id) {
  const [rows] = await pool.query('SELECT * FROM categories WHERE id = ?', [id]);
  return rows[0] ?? null;
}

export async function createCategory(pool, category) {
  const [result] = await pool.query(
    'INSERT INTO categories (name, description, status) VALUES (?, ?, ?)',
    [category.name, category.description ?? null, category.status ?? 'active']
  );
  return await getCategoryById(pool, result.insertId);
}

export async function updateCategory(pool, id, category) {
  await pool.query(
    'UPDATE categories SET name = ?, description = ?, status = ? WHERE id = ?',
    [category.name, category.description, category.status, id]
  );
  return await getCategoryById(pool, id);
}

export async function deleteCategory(pool, id) {
  const [result] = await pool.query('DELETE FROM categories WHERE id = ?', [id]);
  return result.affectedRows > 0;
}
