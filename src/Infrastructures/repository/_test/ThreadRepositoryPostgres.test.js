const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');
const pool = require('../../database/postgres/pool');
const CreatedThread = require('../../../Domains/threads/entities/CreatedThread');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('ThreadRepositoryPostgres', () => {
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

  describe('addThread function', () => {
    it('should success add thread', async () => {
      const payload = {
        title: 'thread title',
        body: 'thread body',
      };

      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      await threadRepositoryPostgres.addThread(payload, userPayload.id);

      const thread = await ThreadsTableTestHelper.findThreadById('thread-123');

      expect(thread).toHaveLength(1);
    });

    it('should return CreatedThread correctly', async () => {
      const payload = {
        title: 'thread title',
        body: 'thread body',
      };

      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      const createdThread = await threadRepositoryPostgres.addThread(payload, userPayload.id);

      expect(createdThread).toStrictEqual(new CreatedThread({
        id: 'thread-123',
        title: 'thread title',
        owner: userPayload.id,
      }));
    });
  });

  describe('checkAvailabilityThread function', () => {
    it('should throw NotFoundError when thread not available', async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      await expect(threadRepositoryPostgres.checkAvailabilityThread('thread-123')).rejects.toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when thread available', async () => {
      await ThreadsTableTestHelper.addThread({ title: 'thread title', owner: userPayload.id });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      await expect(threadRepositoryPostgres.checkAvailabilityThread('thread-123')).resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('getDetailThread', () => {
    it('should throw NotFoundError when thread not available', async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      await expect(threadRepositoryPostgres.getDetailThread('thread-123')).rejects.toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when thread available', async () => {
      await ThreadsTableTestHelper.addThread({ title: 'thread title', owner: userPayload.id });

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});
      await expect(threadRepositoryPostgres.getDetailThread('thread-123', userPayload.id)).resolves.not.toThrowError(AuthorizationError);
    });

    it('should contain persisted data', async () => {
      await ThreadsTableTestHelper.addThread({ title: 'thread title', owner: userPayload.id, created_at: '2021-22-10T13:00:00' });
      await ThreadsTableTestHelper.addComment({ content: 'thread comment', owner: userPayload.id, created_at: '2021-24-10T13:00:00' });

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      const expectedDetailThread = {
        id: 'thread-123',
        title: 'thread title',
        body: 'thread body',
        date: '2021-22-10T13:00:00',
        username: 'user1',
      };

      const expectedThreadComments = [
        {
          id: 'comment-123',
          username: 'user1',
          date: '2021-24-10T13:00:00',
          content: 'thread comment',
          is_delete: false,
        },
      ];

      const resultThread = await threadRepositoryPostgres.getDetailThread('thread-123');
      const resultThreadComments = await commentRepositoryPostgres.getCommentsByThreadId('thread-123');

      expect(resultThread).toStrictEqual(expectedDetailThread);
      expect(resultThreadComments).toStrictEqual(expectedThreadComments);
      expect({ ...resultThread, comments: resultThreadComments }).toStrictEqual({ ...expectedDetailThread, comments: expectedThreadComments });
    });

    it('should contain persisted data when comment deleted', async () => {
      await ThreadsTableTestHelper.addThread({ title: 'thread title', owner: userPayload.id, created_at: '2021-22-10T13:00:00' });
      await ThreadsTableTestHelper.addComment({ content: 'thread comment', owner: userPayload.id, created_at: '2021-24-10T13:00:00' });
      await ThreadsTableTestHelper.deleteComment('comment-123');

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      const expectedDetailThread = {
        id: 'thread-123',
        title: 'thread title',
        body: 'thread body',
        date: '2021-22-10T13:00:00',
        username: 'user1',
      };

      const expectedThreadComments = [
        {
          id: 'comment-123',
          username: 'user1',
          date: '2021-24-10T13:00:00',
          content: 'thread comment',
          is_delete: true,
        },
      ];

      const resultThread = await threadRepositoryPostgres.getDetailThread('thread-123');
      const resultThreadComments = await commentRepositoryPostgres.getCommentsByThreadId('thread-123');

      expect(resultThread).toStrictEqual(expectedDetailThread);
      expect(resultThreadComments).toStrictEqual(expectedThreadComments);
      expect({ ...resultThread, comments: resultThreadComments }).toStrictEqual({ ...expectedDetailThread, comments: expectedThreadComments });
    });

    it('should contain persisted data when reply deleted', async () => {
      await ThreadsTableTestHelper.addThread({ title: 'thread title', owner: userPayload.id, created_at: '2021-22-10T13:00:00' });
      await ThreadsTableTestHelper.addComment({ content: 'thread comment', owner: userPayload.id, created_at: '2021-24-10T13:00:00' });
      await ThreadsTableTestHelper.addReply({ content: 'reply comment', owner: userPayload.id, created_at: '2021-24-10T13:00:00' });
      await ThreadsTableTestHelper.deleteReply('reply-123');

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      const expectedDetailThread = {
        id: 'thread-123',
        title: 'thread title',
        body: 'thread body',
        date: '2021-22-10T13:00:00',
        username: 'user1',
      };

      const expectedThreadComments = [
        {
          id: 'comment-123',
          username: 'user1',
          date: '2021-24-10T13:00:00',
          content: 'thread comment',
          is_delete: false,
        },
      ];

      const expectedReplyComment = [
        {
          id: 'reply-123',
          username: 'user1',
          date: '2021-24-10T13:00:00',
          content: 'reply comment',
          is_delete: true,
        },
      ];

      const expectedCommentsReplies = await Promise.all(expectedThreadComments.map(async (item) => ({
        id: item.id,
        username: item.username,
        date: item.date,
        content: item.content,
        replies: expectedReplyComment,
      })));

      const resultThread = await threadRepositoryPostgres.getDetailThread('thread-123');
      const resultThreadComments = await commentRepositoryPostgres.getCommentsByThreadId('thread-123');
      const commentIds = resultThreadComments.map(({ id }) => (id));
      const resultCommentReplies = await replyRepositoryPostgres.getRepliesByCommentId(commentIds);

      const resultCommentsReplies = resultThreadComments.map(({
        id, username, date, content,
      }) => ({
        id,
        username,
        date,
        content,
        replies: resultCommentReplies,
      }));

      expect(resultThread).toStrictEqual(expectedDetailThread);
      expect(resultThreadComments).toStrictEqual(expectedThreadComments);
      expect({ ...resultThread, comments: resultCommentsReplies }).toStrictEqual({ ...expectedDetailThread, comments: expectedCommentsReplies });
    });
  });
});