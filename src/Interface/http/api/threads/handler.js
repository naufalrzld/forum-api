const ThreadUseCase = require('../../../../Applications/use_case/ThreadUseCase');
const CommentUseCase = require('../../../../Applications/use_case/CommentUseCase');
const ReplyUseCase = require('../../../../Applications/use_case/ReplyUseCase');

class ThreadsHandler {
  constructor(container) {
    this._container = container;

    this.postThreadHandler = this.postThreadHandler.bind(this);
    this.postThreadCommentHandler = this.postThreadCommentHandler.bind(this);
    this.postReplyCommentHandler = this.postReplyCommentHandler.bind(this);
    this.getDetailThreadHandler = this.getDetailThreadHandler.bind(this);
    this.deleteThreadCommentHandler = this.deleteThreadCommentHandler.bind(this);
    this.deleteReplyCommentHandler = this.deleteReplyCommentHandler.bind(this);
  }

  async postThreadHandler(request, h) {
    const threadUseCase = this._container.getInstance(ThreadUseCase.name);
    const { id: credentialId } = request.auth.credentials;

    const addedThread = await threadUseCase.addThread(request.payload, credentialId);

    const response = h.response({
      status: 'success',
      data: {
        addedThread,
      },
    });

    response.code(201);
    return response;
  }

  async postThreadCommentHandler(request, h) {
    const commentUseCase = this._container.getInstance(CommentUseCase.name);
    const { threadId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    const addedComment = await commentUseCase.addComment(request.payload, threadId, credentialId);

    const response = h.response({
      status: 'success',
      data: {
        addedComment,
      },
    });

    response.code(201);
    return response;
  }

  async postReplyCommentHandler(request, h) {
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

  async getDetailThreadHandler(request, h) {
    const threadUseCase = this._container.getInstance(ThreadUseCase.name);
    const { threadId } = request.params;

    const thread = await threadUseCase.getDetailThread(threadId);

    const response = h.response({
      status: 'success',
      data: {
        thread,
      },
    });

    response.code(200);
    return response;
  }

  async deleteThreadCommentHandler(request) {
    const commentUseCase = this._container.getInstance(CommentUseCase.name);
    const { threadId, commentId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await commentUseCase.deleteComment(threadId, commentId, credentialId);

    return {
      status: 'success',
    };
  }

  async deleteReplyCommentHandler(request) {
    const replyUseCase = this._container.getInstance(ReplyUseCase.name);
    const { threadId, commentId, replyId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await replyUseCase.deleteReply(threadId, commentId, replyId, credentialId);

    return {
      status: 'success',
    };
  }
}

module.exports = ThreadsHandler;