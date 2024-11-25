import db from '../config/database.js';

class Notice {
  static async create(notice) {
    const [result] = await db.execute(
      'INSERT INTO notices (title, content, author_id, is_parcel) VALUES (?, ?, ?, ?)',
      [notice.title, notice.content, notice.author_id, notice.is_parcel || false]
    );
    return result.insertId;
  }

  static async findAll(filters = {}) {
    let query = 'SELECT * FROM notices';
    const params = [];

    // Add filters for parcel/regular notices if specified
    if (filters.is_parcel !== undefined) {
      query += ' WHERE is_parcel = ?';
      params.push(filters.is_parcel);
    }

    query += ' ORDER BY created_at DESC';

    const [rows] = await db.execute(query, params);
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.execute(
      'SELECT * FROM notices WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async update(id, notice) {
    const [result] = await db.execute(
      'UPDATE notices SET title = ?, content = ?, is_parcel = ? WHERE id = ?',
      [notice.title, notice.content, notice.is_parcel, id]
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await db.execute(
      'DELETE FROM notices WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  // Method to find only parcel notices
  static async findParcels() {
    const [rows] = await db.execute(
      'SELECT * FROM notices WHERE is_parcel = true ORDER BY created_at DESC'
    );
    return rows;
  }

  // Method to search notices
  static async search(searchTerm) {
    const [rows] = await db.execute(
      'SELECT * FROM notices WHERE title LIKE ? OR content LIKE ? ORDER BY created_at DESC',
      [`%${searchTerm}%`, `%${searchTerm}%`]
    );
    return rows;
  }
}

export default Notice;