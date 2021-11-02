const CreateThread = require('../../Domains/threads/entities/CreateThread');
const DetailTread = require('../../Domains/threads/entities/DetailThread');
const CommentThread = require('../../Domains/threads/entities/CommentThread');
const ReplyThread = require('../../Domains/threads/entities/ReplyThread');

class ThreadUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async addThread(payload, owner) {
    const createThread = new CreateThread(payload);
    return this._threadRepository.addThread(createThread, owner);
  }

  async getDetailThread(threadId) {
    const resultThread = await this._threadRepository.getDetailThread(threadId);
    const resultComments = await this._commentRepository.getCommentsByThreadId(threadId);
    const commentIds = resultComments.map(({ id }) => (id));
    const resultCommentReplies = await this._replyRepository.getRepliesByCommentId(commentIds);
    const threadReplies = resultCommentReplies.map(({
      id, content, date, username, is_delete,
    }) => {
      let msg = content;
      if (is_delete) msg = '**balasan telah dihapus**';
      return new ReplyThread({
        id, username, date, content: msg,
      });
    });

    const threadComments = resultComments.map(({
      id, username, date, content, like_count, is_delete,
    }) => {
      let msg = content;
      if (is_delete) msg = '**komentar telah dihapus**';
      return new CommentThread({
        id,
        username,
        date,
        content: msg,
        likeCount: Number(like_count),
      }, threadReplies);
    });

    return new DetailTread(resultThread, threadComments);
  }
}

module.exports = ThreadUseCase;