const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const CreateComment = require('../../../Domains/comments/entities/CreateComment');
const CommentUseCase = require('../CommentUseCase');

describe('CommentUseCase', () => {
  it('should orchestrating the add comment action correctly', async () => {
    const useCasePayload = {
      content: 'thread comment',
    };

    const expectedCreatedComment = {
      id: 'comment-123',
      content: 'thread comment',
      owner: 'user-123',
    };

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    mockThreadRepository.checkAvailabilityThread = jest.fn(() => Promise.resolve());
    mockCommentRepository.addComment = jest.fn(() => Promise.resolve(expectedCreatedComment));

    const commentUseCase = new CommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    const createdComment = await commentUseCase.addComment(useCasePayload, 'thread-123', 'user-123');

    expect(createdComment).toStrictEqual(expectedCreatedComment);
    expect(mockThreadRepository.checkAvailabilityThread).toBeCalledWith('thread-123');
    expect(mockCommentRepository.addComment).toBeCalledWith(
      new CreateComment(useCasePayload),
      'thread-123',
      'user-123',
    );
  });

  it('should orchestrating the delete comment action correctly', async () => {
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    mockThreadRepository.checkAvailabilityThread = jest.fn(() => Promise.resolve());
    mockCommentRepository.checkAvailabilityComment = jest.fn(() => Promise.resolve());
    mockCommentRepository.verifyCommentOwner = jest.fn(() => Promise.resolve());
    mockCommentRepository.deleteComment = jest.fn(() => Promise.resolve());

    const commentUseCase = new CommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    await expect(commentUseCase.deleteComment('thread-123', 'comment-123', 'user-123')).resolves.not.toThrowError(NotFoundError);
    await expect(commentUseCase.deleteComment('thread-123', 'comment-123', 'user-123')).resolves.not.toThrowError(AuthorizationError);
    expect(mockThreadRepository.checkAvailabilityThread).toBeCalledWith('thread-123');
    expect(mockCommentRepository.checkAvailabilityComment).toBeCalledWith('comment-123');
    expect(mockCommentRepository.verifyCommentOwner).toBeCalledWith('comment-123', 'user-123');
    expect(mockCommentRepository.deleteComment).toBeCalledWith('comment-123');
  });
});