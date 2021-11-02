const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
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

  const threadPayload = {
    id: 'thread-123',
    title: 'thread title',
    owner: userPayload.id,
  };

  beforeAll(async () => {
    await UsersTableTestHelper.addUser(userPayload);
    await ThreadsTableTestHelper.addThread(threadPayload);
  });

  afterAll(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('addComment function', () => {
    it('should success add comment and return CreatedComment object correctly', async () => {
      const payload = {
        content: 'thread comment',
      };

      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      const createdComment = await commentRepositoryPostgres.addComment(payload, threadPayload.id, userPayload.id);
      const comment = await CommentsTableTestHelper.findComment('comment-123');

      expect(comment).toHaveLength(1);
      expect(createdComment).toStrictEqual(new CreatedComment({
        id: 'comment-123',
        content: 'thread comment',
        owner: userPayload.id,
      }));
    });
  });

  describe('checkAvailabilityComment function', () => {
    it('should not throw NotFoundError when comment available', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await expect(commentRepositoryPostgres.checkAvailabilityComment('comment-123')).resolves.not.toThrowError(NotFoundError);
    });

    it('should throw NotFoundError when comment not available', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await expect(commentRepositoryPostgres.checkAvailabilityComment('comment-1234')).rejects.toThrowError(NotFoundError);
    });

    it('should throw NotFoundError when comment has been deleted', async () => {
      await CommentsTableTestHelper.deleteComment('comment-123');

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await expect(commentRepositoryPostgres.checkAvailabilityComment('comment-123')).rejects.toThrowError(NotFoundError);
    });
  });

  describe('getCommentsByThreadId function', () => {
    it('should response with correct property', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      const comment = await commentRepositoryPostgres.getCommentsByThreadId(threadPayload.id);

      expect(comment[0].id).toBeDefined();
      expect(comment[0].id).not.toBeNull();
      expect(comment[0].content).toBeDefined();
      expect(comment[0].content).not.toBeNull();
      expect(comment[0].date).toBeDefined();
      expect(comment[0].date).not.toBeNull();
      expect(comment[0].username).toBeDefined();
      expect(comment[0].username).not.toBeNull();
      expect(comment[0].like_count).toBeDefined();
      expect(comment[0].like_count).not.toBeNull();
    });
  });

  describe('verifyCommentOwner function', () => {
    it('should throw AuthorizationError when not owned comment', async () => {
      await CommentsTableTestHelper.restoreComment('comment-123');

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await expect(commentRepositoryPostgres.verifyCommentOwner('comment-123', 'user-123')).rejects.toThrowError(AuthorizationError);
    });

    it('should not throw AuthorizationError when owned comment', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await expect(commentRepositoryPostgres.verifyCommentOwner('comment-123', userPayload.id)).resolves.not.toThrowError(AuthorizationError);
    });
  });

  describe('likeComment function', () => {
    it('should success like comment', async () => {
      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      await commentRepositoryPostgres.likeComment('comment-123', userPayload.id);

      const likedComment = await CommentsTableTestHelper.findLikedComment('comment-123', userPayload.id);

      expect(likedComment).toHaveLength(1);
    });
  });

  describe('checkLikeComment function', () => {
    it('should return 0 when liked comment not available', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      const likedComment = await commentRepositoryPostgres.checkLikeComment('comment-1234', userPayload.id);

      expect(likedComment).toEqual(0);
    });

    it('should return greater than 0 when liked comment not available', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      const likedComment = await commentRepositoryPostgres.checkLikeComment('comment-123', userPayload.id);

      expect(likedComment).toBeGreaterThan(0);
    });
  });

  describe('unlikeComment function', () => {
    it('should success unlike comment', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await commentRepositoryPostgres.unlikeComment('comment-123', userPayload.id);

      const likedComment = await CommentsTableTestHelper.findLikedComment('comment-123', userPayload.id);

      expect(likedComment).toHaveLength(0);
    });
  });

  describe('deleteComment', () => {
    it('should delete comment correctly', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await commentRepositoryPostgres.deleteComment('comment-123');
      const comment = await CommentsTableTestHelper.findComment('comment-123');

      expect(comment[0].is_delete).toEqual(true);
    });
  });
});