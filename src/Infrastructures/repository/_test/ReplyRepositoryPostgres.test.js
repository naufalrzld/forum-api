const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');
const pool = require('../../database/postgres/pool');
const CreatedReply = require('../../../Domains/replies/entities/CreatedReply');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('ThreadRepositoryPostgres', () => {
  const userPayload = {
    id: 'user-1',
    username: 'user1',
    password: 'secret',
    fullname: 'User 1',
  };

  const threadPayload = {
    id: 'thread-123',
    title: 'thread title',
    owner: userPayload.id,
  };

  const commentPayload = {
    id: 'comment-123',
    content: 'thread comment',
    threadId: threadPayload.id,
    owner: userPayload.id,
  };

  beforeAll(async () => {
    await UsersTableTestHelper.addUser(userPayload);
    await ThreadsTableTestHelper.addThread(threadPayload);
    await CommentsTableTestHelper.addComment(commentPayload);
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('addReply function', () => {
    it('should success add reply', async () => {
      const payload = {
        content: 'reply comment',
      };

      const fakeIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      await replyRepositoryPostgres.addReply(payload, commentPayload.id, userPayload.id);

      const reply = await RepliesTableTestHelper.findReply('reply-123');

      expect(reply).toHaveLength(1);
    });

    it('should return CreatedReply object correctly', async () => {
      const payload = {
        content: 'reply comment',
      };

      const fakeIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      const createdComment = await replyRepositoryPostgres.addReply(payload, 'comment-123', userPayload.id);

      expect(createdComment).toStrictEqual(new CreatedReply({
        id: 'reply-123',
        content: 'reply comment',
        owner: userPayload.id,
      }));
    });
  });

  describe('checkAvailabilityReply function', () => {
    it('should throw NotFoundError when reply not available', async () => {
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      await expect(replyRepositoryPostgres.checkAvailabilityReply('reply-123')).rejects.toThrowError(NotFoundError);
    });

    it('should throw NotFoundError when reply has been deleted', async () => {
      await RepliesTableTestHelper.addReply({ content: 'reply comment', owner: userPayload.id });
      await RepliesTableTestHelper.deleteReply('reply-123');

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      await expect(replyRepositoryPostgres.checkAvailabilityReply('reply-123')).rejects.toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when reply available', async () => {
      await RepliesTableTestHelper.addReply({ content: 'reply comment', owner: userPayload.id });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      await expect(replyRepositoryPostgres.checkAvailabilityReply('reply-123')).resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('verifyReplyOwner', () => {
    it('should throw AuthorizationError when not owned reply', async () => {
      await RepliesTableTestHelper.addReply({ content: 'reply comment', owner: userPayload.id });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      await expect(replyRepositoryPostgres.verifyReplyOwner('reply-123', 'user-123')).rejects.toThrowError(AuthorizationError);
    });

    it('should not throw AuthorizationError when owned comment', async () => {
      await RepliesTableTestHelper.addReply({ content: 'reply comment', owner: userPayload.id });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      await expect(replyRepositoryPostgres.verifyReplyOwner('reply-123', userPayload.id)).resolves.not.toThrowError(AuthorizationError);
    });
  });

  describe('deleteReply', () => {
    it('should delete reply correctly', async () => {
      await RepliesTableTestHelper.addReply({ content: 'reply comment', owner: userPayload.id });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      await replyRepositoryPostgres.deleteReply('reply-123');

      const reply = await RepliesTableTestHelper.findReply('reply-123');

      expect(reply[0].is_delete).toEqual(true);
    });
  });
});