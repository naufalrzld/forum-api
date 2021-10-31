/* istanbul ignore file */

const { createContainer } = require('instances-container');

const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');
const Jwt = require('@hapi/jwt');
const pool = require('./database/postgres/pool');

const UserRepositoryPostgres = require('./repository/UserRepositoryPostgres');
const AuthRepositoryPostgres = require('./repository/AuthRepositoryPostgres');
const ThreadRepositoryPostgres = require('./repository/ThreadRepositoryPostgres');
const CommentRepositoryPostgres = require('./repository/CommentRepositoryPostgres');
const ReplyRepositoryPostgres = require('./repository/ReplyRepositoryPostgres');
const BcryptPasswordHash = require('./security/BcryptPasswordHash');
const JwtTokenManager = require('./tokenize/JwtTokenManager');

const UserUseCase = require('../Applications/use_case/UserUseCase');
const UserRepository = require('../Domains/users/UserRepository');
const AuthUseCase = require('../Applications/use_case/AuthUseCase');
const AuthRepository = require('../Domains/authentications/AuthRepository');
const ThreadUseCase = require('../Applications/use_case/ThreadUseCase');
const ThreadRepository = require('../Domains/threads/ThreadRepository');
const CommentUseCase = require('../Applications/use_case/CommentUseCase');
const CommentRepository = require('../Domains/comments/CommentRepository');
const ReplyUseCase = require('../Applications/use_case/ReplyUseCase');
const ReplyRepository = require('../Domains/replies/ReplyRepository');
const PasswordHash = require('../Applications/security/PasswordHash');
const TokenManager = require('../Applications/tokenize/TokenManager');

const container = createContainer();

container.register([
  {
    key: UserRepository.name,
    Class: UserRepositoryPostgres,
    parameter: {
      dependencies: [
        {
          concrete: pool,
        },
        {
          concrete: nanoid,
        },
      ],
    },
  },
  {
    key: AuthRepository.name,
    Class: AuthRepositoryPostgres,
    parameter: {
      dependencies: [
        {
          concrete: pool,
        },
      ],
    },
  },
  {
    key: ThreadRepository.name,
    Class: ThreadRepositoryPostgres,
    parameter: {
      dependencies: [
        {
          concrete: pool,
        },
        {
          concrete: nanoid,
        },
      ],
    },
  },
  {
    key: CommentRepository.name,
    Class: CommentRepositoryPostgres,
    parameter: {
      dependencies: [
        {
          concrete: pool,
        },
        {
          concrete: nanoid,
        },
      ],
    },
  },
  {
    key: ReplyRepository.name,
    Class: ReplyRepositoryPostgres,
    parameter: {
      dependencies: [
        {
          concrete: pool,
        },
        {
          concrete: nanoid,
        },
      ],
    },
  },
  {
    key: PasswordHash.name,
    Class: BcryptPasswordHash,
    parameter: {
      dependencies: [
        {
          concrete: bcrypt,
        },
      ],
    },
  },
  {
    key: TokenManager.name,
    Class: JwtTokenManager,
    parameter: {
      dependencies: [
        {
          concrete: Jwt.token,
        },
      ],
    },
  },
]);

container.register([
  {
    key: UserUseCase.name,
    Class: UserUseCase,
    parameter: {
      injectType: 'destructuring',
      dependencies: [
        {
          name: 'userRepository',
          internal: UserRepository.name,
        },
        {
          name: 'passwordHash',
          internal: PasswordHash.name,
        },
      ],
    },
  },
  {
    key: AuthUseCase.name,
    Class: AuthUseCase,
    parameter: {
      injectType: 'destructuring',
      dependencies: [
        {
          name: 'authRepository',
          internal: AuthRepository.name,
        },
        {
          name: 'tokenManager',
          internal: TokenManager.name,
        },
      ],
    },
  },
  {
    key: ThreadUseCase.name,
    Class: ThreadUseCase,
    parameter: {
      injectType: 'destructuring',
      dependencies: [
        {
          name: 'threadRepository',
          internal: ThreadRepository.name,
        },
        {
          name: 'commentRepository',
          internal: CommentRepository.name,
        },
        {
          name: 'replyRepository',
          internal: ReplyRepository.name,
        },
      ],
    },
  },
  {
    key: CommentUseCase.name,
    Class: CommentUseCase,
    parameter: {
      injectType: 'destructuring',
      dependencies: [
        {
          name: 'threadRepository',
          internal: ThreadRepository.name,
        },
        {
          name: 'commentRepository',
          internal: CommentRepository.name,
        },
      ],
    },
  },
  {
    key: ReplyUseCase.name,
    Class: ReplyUseCase,
    parameter: {
      injectType: 'destructuring',
      dependencies: [
        {
          name: 'threadRepository',
          internal: ThreadRepository.name,
        },
        {
          name: 'commentRepository',
          internal: CommentRepository.name,
        },
        {
          name: 'replyRepository',
          internal: ReplyRepository.name,
        },
      ],
    },
  },
]);

module.exports = container;