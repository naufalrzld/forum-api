class CommentThread {
  constructor(payloadComment, payloadReplies) {
    this._verifyPayload(payloadComment, payloadReplies);

    const {
      id,
      content,
      date,
      username,
      likeCount,
    } = payloadComment;

    this.id = id;
    this.content = content;
    this.date = date;
    this.username = username;
    this.likeCount = likeCount;
    this.replies = payloadReplies;
  }

  _verifyPayload({
    id,
    content,
    date,
    username,
    likeCount,
  }, replies) {
    if (!id || !content || !date || !username || likeCount === undefined || !replies) {
      throw new Error('COMMENT_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof id !== 'string' || typeof content !== 'string' || typeof date !== 'string' || typeof username !== 'string' || typeof likeCount !== 'number' || !Array.isArray(replies)) {
      throw new Error('COMMENT_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = CommentThread;