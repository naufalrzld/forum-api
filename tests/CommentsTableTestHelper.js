/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const CommentsTableTestHelper = {
  async addComment({
    id = 'comment-123', content = 'thread comment', threadId = 'thread-123', owner = 'user-123', created_at = undefined,
  }) {
    let createdAt;
    if (!created_at) createdAt = new Date().toISOString();
    else createdAt = created_at;

    const query = {
      text: 'INSERT INTO comments VALUES($1 ,$2, $3, $4, $5)',
      values: [id, content, threadId, owner, createdAt],
    };

    await pool.query(query);
  },

  async findComment(id) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);

    return result.rows;
  },

  async findLikedComment(commentId, userId) {
    const query = {
      text: 'SELECT * FROM liked_comments WHERE comment_id = $1 AND user_id = $2',
      values: [commentId, userId],
    };

    const result = await pool.query(query);

    return result.rows;
  },

  async deleteComment(id) {
    const query = {
      text: 'UPDATE comments SET is_delete = true WHERE id = $1',
      values: [id],
    };

    await pool.query(query);
  },

  async restoreComment(id) {
    const query = {
      text: 'UPDATE comments SET is_delete = false WHERE id = $1',
      values: [id],
    };

    await pool.query(query);
  },

  async cleanTable() {
    await pool.query('TRUNCATE TABLE comments CASCADE');
  },
};

module.exports = CommentsTableTestHelper;