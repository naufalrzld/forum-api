const CreateReply = require('../../Domains/replies/entities/CreateReply');

class ReplyUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async addReply(payload, threadId, commentId, owner) {
    const createReply = new CreateReply(payload);
    await this._threadRepository.checkAvailabilityThread(threadId);
    await this._commentRepository.checkAvailabilityComment(commentId);
    return this._replyRepository.addReply(createReply, commentId, owner);
  }

  async deleteReply(threadId, commentId, replyId, owner) {
    await this._threadRepository.checkAvailabilityThread(threadId);
    await this._commentRepository.checkAvailabilityComment(commentId);
    await this._replyRepository.checkAvailabilityReply(replyId);
    await this._replyRepository.verifyReplyOwner(replyId, owner);
    await this._replyRepository.deleteReply(replyId);
  }
}

module.exports = ReplyUseCase;