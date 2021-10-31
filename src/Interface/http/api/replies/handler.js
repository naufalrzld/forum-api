const ReplyUseCase = require('../../../../Applications/use_case/ReplyUseCase');

class RepliesHandler {
  constructor(container) {
    this._container = container;

    this.postReplyHandler = this.postReplyHandler.bind(this);
    this.deleteReplyHandler = this.deleteReplyHandler.bind(this);
  }

  async postReplyHandler(request, h) {
    const replyUseCase = this._container.getInstance(ReplyUseCase.name);
    const { threadId, commentId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    const addedReply = await replyUseCase.addReply(request.payload, threadId, commentId, credentialId);

    const response = h.response({
      status: 'success',
      data: {
        addedReply,
      },
    });

    response.code(201);
    return response;
  }

  async deleteReplyHandler(request) {
    const replyUseCase = this._container.getInstance(ReplyUseCase.name);
    const { threadId, commentId, replyId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await replyUseCase.deleteReply(threadId, commentId, replyId, credentialId);

    return {
      status: 'success',
    };
  }
}

module.exports = RepliesHandler;