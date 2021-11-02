const CommentUseCase = require('../../../../Applications/use_case/CommentUseCase');

class CommentsHandler {
  constructor(container) {
    this._container = container;

    this.postCommentHandler = this.postCommentHandler.bind(this);
    this.putLikeUnlikeCommentHandler = this.putLikeUnlikeCommentHandler.bind(this);
    this.deleteCommentHandler = this.deleteCommentHandler.bind(this);
  }

  async postCommentHandler(request, h) {
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

  async putLikeUnlikeCommentHandler(request) {
    const commentUseCase = this._container.getInstance(CommentUseCase.name);
    const { id: credentialId } = request.auth.credentials;
    const { threadId, commentId } = request.params;

    await commentUseCase.likeUnlikeComment(threadId, commentId, credentialId);

    return {
      status: 'success',
    };
  }

  async deleteCommentHandler(request) {
    const commentUseCase = this._container.getInstance(CommentUseCase.name);
    const { threadId, commentId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await commentUseCase.deleteComment(threadId, commentId, credentialId);

    return {
      status: 'success',
    };
  }
}

module.exports = CommentsHandler;