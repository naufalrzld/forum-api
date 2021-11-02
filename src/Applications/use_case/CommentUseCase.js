const CreateComment = require('../../Domains/comments/entities/CreateComment');

class CommentUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async addComment(payload, threadId, owner) {
    const createComment = new CreateComment(payload);
    await this._threadRepository.checkAvailabilityThread(threadId);
    return this._commentRepository.addComment(createComment, threadId, owner);
  }

  async likeUnlikeComment(threadId, commentId, userId) {
    await this._threadRepository.checkAvailabilityThread(threadId);
    await this._commentRepository.checkAvailabilityComment(commentId);
    const isLiked = await this._commentRepository.checkLikeComment(commentId, userId);
    if (!isLiked) {
      await this._commentRepository.likeComment(commentId, userId);
    } else {
      await this._commentRepository.unlikeComment(commentId, userId);
    }
  }

  async deleteComment(threadId, commentId, owner) {
    await this._threadRepository.checkAvailabilityThread(threadId);
    await this._commentRepository.checkAvailabilityComment(commentId);
    await this._commentRepository.verifyCommentOwner(commentId, owner);
    await this._commentRepository.deleteComment(commentId);
  }
}

module.exports = CommentUseCase;