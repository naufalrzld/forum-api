/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const ThreadsTableTestHelper = {
  async addThread({
    id = 'thread-123', title = 'thread title', body = 'thread body', owner = 'user-123', created_at = undefined,
  }) {
    let createdAt;
    if (!created_at) createdAt = new Date().toISOString();
    else createdAt = created_at;

    const query = {
      text: 'INSERT INTO threads VALUES($1 ,$2, $3, $4, $5)',
      values: [id, title, body, owner, createdAt],
    };

    await pool.query(query);
  },

  async findThreadById(id) {
    const query = {
      text: 'SELECT * FROM threads WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);

    return result.rows;
  },

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
    await pool.query('TRUNCATE TABLE threads CASCADE');
  },
};

module.exports = ThreadsTableTestHelper;