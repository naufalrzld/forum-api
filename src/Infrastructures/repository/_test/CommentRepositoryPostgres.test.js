const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const pool = require('../../database/postgres/pool');
const CreatedComment = require('../../../Domains/comments/entities/CreatedComment');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('CommentRepositoryPostgres', () => {
  const userPayload = {
    id: 'user-1',
    username: 'user1',
    password: 'secret',
    fullname: 'User 1',
  };

  beforeEach(async () => {
    await UsersTableTestHelper.addUser(userPayload);
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addComment function', () => {
    it('should success add comment', async () => {
      await ThreadsTableTestHelper.addThread({ title: 'thread title', owner: userPayload.id });

      const payload = {
        content: 'thread comment',
      };

      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      await commentRepositoryPostgres.addComment(payload, 'thread-123', userPayload.id);

      const comment = await ThreadsTableTestHelper.findComment('comment-123');

      expect(comment).toHaveLength(1);
    });

    it('should return CreatedComment correctly', async () => {
      await ThreadsTableTestHelper.addThread({ title: 'thread title', owner: userPayload.id });

      const payload = {
        content: 'thread comment',
      };

      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      const createdComment = await commentRepositoryPostgres.addComment(payload, 'thread-123', userPayload.id);

      expect(createdComment).toStrictEqual(new CreatedComment({
        id: 'comment-123',
        content: 'thread comment',
        owner: userPayload.id,
      }));
    });
  });

  describe('checkAvailabilityComment function', () => {
    it('should throw NotFoundError when comment not available', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await expect(commentRepositoryPostgres.checkAvailabilityComment('comment-123')).rejects.toThrowError(NotFoundError);
    });

    it('should throw NotFoundError when comment has been deleted', async () => {
      await ThreadsTableTestHelper.addThread({ title: 'thread title', owner: userPayload.id });
      await ThreadsTableTestHelper.addComment({ content: 'thread comment', owner: userPayload.id });
      await ThreadsTableTestHelper.deleteComment('comment-123');

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await expect(commentRepositoryPostgres.checkAvailabilityComment('comment-123')).rejects.toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when comment available', async () => {
      await ThreadsTableTestHelper.addThread({ title: 'thread title', owner: userPayload.id });
      await ThreadsTableTestHelper.addComment({ content: 'thread comment', owner: userPayload.id });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await expect(commentRepositoryPostgres.checkAvailabilityComment('comment-123')).resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('verifyCommentOwner', () => {
    it('should throw AuthorizationError when not owned comment', async () => {
      await ThreadsTableTestHelper.addThread({ title: 'thread title', owner: userPayload.id });
      await ThreadsTableTestHelper.addComment({ content: 'thread comment', owner: userPayload.id });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await expect(commentRepositoryPostgres.verifyCommentOwner('comment-123', 'user-123')).rejects.toThrowError(AuthorizationError);
    });

    it('should not throw AuthorizationError when owned comment', async () => {
      await ThreadsTableTestHelper.addThread({ title: 'thread title', owner: userPayload.id });
      await ThreadsTableTestHelper.addComment({ content: 'thread comment', owner: userPayload.id });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await expect(commentRepositoryPostgres.verifyCommentOwner('comment-123', userPayload.id)).resolves.not.toThrowError(AuthorizationError);
    });
  });

  describe('deleteComment', () => {
    it('should delete comment correctly', async () => {
      await ThreadsTableTestHelper.addThread({ title: 'thread title', owner: userPayload.id });
      await ThreadsTableTestHelper.addComment({ content: 'thread comment', owner: userPayload.id });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await commentRepositoryPostgres.deleteComment('comment-123');
      await expect(commentRepositoryPostgres.checkAvailabilityComment('comment-123')).rejects.toThrowError(NotFoundError);
    });
  });
});