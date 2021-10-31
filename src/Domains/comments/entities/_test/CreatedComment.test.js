const CreatedComment = require('../CreatedComment');

describe('CreateComment entity', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      content: 'thread comment',
      owner: 'user-123',
    };

    expect(() => new CreatedComment(payload)).toThrowError('CREATED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      id: 123,
      content: 'thread comment',
      owner: {},
    };

    expect(() => new CreatedComment(payload)).toThrowError('CREATED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create CreatedComment object correctly', () => {
    const payload = {
      id: 'comment-123',
      content: 'thread comment',
      owner: 'user-123',
    };

    const createdComment = new CreatedComment(payload);

    expect(createdComment.id).toEqual(payload.id);
    expect(createdComment.content).toEqual(payload.content);
    expect(createdComment.owner).toEqual(payload.owner);
  });
});