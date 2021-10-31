const InvariantError = require('./InvariantError');

const DomainErrorTranslator = {
  translate(error) {
    return DomainErrorTranslator._directories[error.message] || error;
  },
};

DomainErrorTranslator._directories = {
  'REGISTER_USER.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('tidak dapat membuat user baru karena properti yang dibutuhkan tidak ada'),
  'REGISTER_USER.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('tidak dapat membuat user baru karena tipe data tidak sesuai'),
  'REGISTER_USER.USERNAME_LIMIT_CHAR': new InvariantError('tidak dapat membuat user baru karena karakter username melebihi batas limit'),
  'REGISTER_USER.USERNAME_CONTAIN_RESTRICTED_CHARACTER': new InvariantError('tidak dapat membuat user baru karena username mengandung karakter terlarang'),
  'AUTH_USER.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('masukkan property yang dibutuhkan'),
  'AUTH_USER.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('terdapat tipe data yang tidak sesuai'),
  'AUTH_USER.USERNAME_LIMIT_CHAR': new InvariantError('username melebihi batas limit'),
  'AUTH_USER.USERNAME_CONTAIN_RESTRICTED_CHARACTER': new InvariantError('username mengandung karakter terlarang'),
  'CREATE_THREAD.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('masukkan property yang dibutuhkan'),
  'CREATE_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('terdapat tipe data yang tidak sesuai'),
  'CREATE_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('masukkan property yang dibutuhkan'),
  'CREATE_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('terdapat tipe data yang tidak sesuai'),
  'CREATE_REPLY.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('masukkan property yang dibutuhkan'),
  'CREATE_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('terdapat tipe data yang tidak sesuai'),
};

module.exports = DomainErrorTranslator;