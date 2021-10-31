const CreatedReply = require('../CreatedReply');

describe('CreatedReply entity', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      content: 'reply comment',
      owner: 'user-123',
    };

    expect(() => new CreatedReply(payload)).toThrowError('CREATED_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      id: 123,
      content: 'reply comment',
      owner: {},
    };

    expect(() => new CreatedReply(payload)).toThrowError('CREATED_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create CreatedReply object correctly', () => {
    const payload = {
      id: 'reply-123',
      content: 'reply comment',
      owner: 'user-123',
    };

    const createdReply = new CreatedReply(payload);

    expect(createdReply.id).toEqual(payload.id);
    expect(createdReply.content).toEqual(payload.content);
    expect(createdReply.owner).toEqual(payload.owner);
  });
});