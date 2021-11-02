/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const RepliesTableTestHelper = {
  async addReply({
    id = 'reply-123', content = 'reply comment', commentId = 'comment-123', owner = 'user-123', created_at = undefined,
  }) {
    let createdAt;
    if (!created_at) createdAt = new Date().toISOString();
    else createdAt = created_at;

    const query = {
      text: 'INSERT INTO replies VALUES($1 ,$2, $3, $4, $5)',
      values: [id, content, commentId, owner, createdAt],
    };

    await pool.query(query);
  },

  async findReply(id) {
    const query = {
      text: 'SELECT * FROM replies WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);

    return result.rows;
  },

  async deleteReply(id) {
    const query = {
      text: 'UPDATE replies SET is_delete = true WHERE id = $1',
      values: [id],
    };

    await pool.query(query);
  },

  async cleanTable() {
    await pool.query('TRUNCATE TABLE replies CASCADE');
  },
};

module.exports = RepliesTableTestHelper;