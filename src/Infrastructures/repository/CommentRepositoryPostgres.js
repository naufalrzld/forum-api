const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const CommentRepository = require('../../Domains/comments/CommentRepository');
const CreatedComment = require('../../Domains/comments/entities/CreatedComment');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(payload, threadId, owner) {
    const { content } = payload;
    const id = `comment-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4) RETURNING id, content, owner',
      values: [id, content, threadId, owner],
    };

    const result = await this._pool.query(query);

    return new CreatedComment({ ...result.rows[0] });
  }

  async checkAvailabilityComment(id) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (result.rows.length === 0 || result.rows[0].is_delete) {
      throw new NotFoundError('comment tidak tersedia');
    }
  }

  async getCommentsByThreadId(threadID) {
    const query = {
      text: `SELECT c.id, u.username, c.created_at AS date, c.content, COUNT(lc.id) AS like_count, c.is_delete 
      FROM comments c 
      JOIN users u ON c.owner = u.id 
      LEFT JOIN liked_comments lc ON c.id = lc.comment_id  
      WHERE c.thread_id = $1 
      GROUP BY c.id, u.username 
      ORDER BY c.created_at ASC`,
      values: [threadID],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }

  async verifyCommentOwner(commentId, owner) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1 AND owner = $2',
      values: [commentId, owner],
    };

    const result = await this._pool.query(query);

    if (result.rowCount === 0) {
      throw new AuthorizationError('akses ditolak');
    }
  }

  async checkLikeComment(commentId, userId) {
    const query = {
      text: 'SELECT * FROM liked_comments WHERE user_id = $1 AND comment_id = $2',
      values: [userId, commentId],
    };

    const result = await this._pool.query(query);

    return result.rowCount;
  }

  async likeComment(commentId, userId) {
    const id = `liked-comment-${this._idGenerator()}`;
    const query = {
      text: 'INSERT INTO liked_comments VALUES($1, $2, $3)',
      values: [id, userId, commentId],
    };

    await this._pool.query(query);
  }

  async unlikeComment(commentId, userId) {
    const query = {
      text: 'DELETE FROM liked_comments WHERE comment_id = $1 AND user_id = $2',
      values: [commentId, userId],
    };

    await this._pool.query(query);
  }

  async deleteComment(commentId) {
    const query = {
      text: 'UPDATE comments SET is_delete = true WHERE id = $1',
      values: [commentId],
    };

    await this._pool.query(query);
  }
}

module.exports = CommentRepositoryPostgres;