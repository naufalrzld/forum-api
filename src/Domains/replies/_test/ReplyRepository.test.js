const ReplyRepository = require('../ReplyRepository');

describe('ThreadRepository interface', () => {
  it('should throw error when invoke abstract behavior', () => {
    const replyRepository = new ReplyRepository();

    expect(replyRepository.addReply({}, '', '')).rejects.toThrowError('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    expect(replyRepository.checkAvailabilityReply('')).rejects.toThrowError('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    expect(replyRepository.getRepliesByCommentId('')).rejects.toThrowError('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    expect(replyRepository.verifyReplyOwner('')).rejects.toThrowError('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    expect(replyRepository.deleteReply('')).rejects.toThrowError('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});