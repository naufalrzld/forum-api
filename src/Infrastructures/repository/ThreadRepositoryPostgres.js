const ThreadRepository = require('../../Domains/threads/ThreadRepository');
const CreatedThread = require('../../Domains/threads/entities/CreatedThread');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addThread(payload, owner) {
    const { title, body } = payload;
    const id = `thread-${this._idGenerator()}`;
    const createdAt = new Date().toISOString();

    const query = {
      text: 'INSERT INTO threads VALUES($1, $2, $3, $4, $5) RETURNING id, title, owner',
      values: [id, title, body, owner, createdAt],
    };

    const result = await this._pool.query(query);

    return new CreatedThread({ ...result.rows[0] });
  }

  async checkAvailabilityThread(id) {
    const query = {
      text: 'SELECT * FROM threads WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (result.rowCount === 0) {
      throw new NotFoundError('thread tidak tersedia');
    }
  }

  async getDetailThread(id) {
    const query = {
      text: `SELECT t.id, t.title, t.body, t.created_at AS date, u.username 
      FROM threads t 
      JOIN users u ON t.owner = u.id 
      WHERE t.id = $1`,
      values: [id],
    };

    const result = await this._pool.query(query);

    if (result.rowCount === 0) {
      throw new NotFoundError('thread tidak tersedia');
    }

    return result.rows[0];
  }
}

module.exports = ThreadRepositoryPostgres;