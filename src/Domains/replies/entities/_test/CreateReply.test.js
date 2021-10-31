const CreateReply = require('../CreateReply');

describe('CreateReply entity', () => {
  it('should throw error when payload did not contain needed property', () => {
    expect(() => new CreateReply({})).toThrowError('CREATE_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    expect(() => new CreateReply({ content: 123 })).toThrowError('CREATE_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create CreateReply object correctly', () => {
    const payload = {
      content: 'reply comment',
    };

    const createReply = new CreateReply(payload);

    expect(createReply.content).toEqual(payload.content);
  });
});