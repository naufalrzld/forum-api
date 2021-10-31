const InvariantError = require('../../Commons/exceptions/InvariantError');
const AuthRepository = require('../../Domains/authentications/AuthRepository');

class AuthRepositoryPostgres extends AuthRepository {
  constructor(pool) {
    super();
    this._pool = pool;
  }

  async saveRefreshToken(token) {
    const query = {
      text: 'INSERT INTO authentications VALUES($1)',
      values: [token],
    };

    await this._pool.query(query);
  }

  async findToken(token) {
    const query = {
      text: 'SELECT token FROM authentications WHERE token = $1',
      values: [token],
    };

    const result = await this._pool.query(query);

    if (result.rowCount === 0) {
      throw new InvariantError('refresh token tidak ditemukan di database');
    }
  }

  async deleteRefreshToken(token) {
    const query = {
      text: 'DELETE FROM authentications WHERE token = $1',
      values: [token],
    };

    await this._pool.query(query);
  }
}

module.exports = AuthRepositoryPostgres;