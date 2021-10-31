class CommentThread {
  constructor(payloadComment, payloadReplies) {
    this._verifyPayload(payloadComment, payloadReplies);

    const {
      id,
      content,
      date,
      username,
    } = payloadComment;

    this.id = id;
    this.content = content;
    this.date = date;
    this.username = username;
    this.replies = payloadReplies;
  }

  _verifyPayload({
    id,
    content,
    date,
    username,
  }, replies) {
    if (!id || !content || !date || !username || !replies) {
      throw new Error('COMMENT_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof id !== 'string' || typeof content !== 'string' || typeof date !== 'string' || typeof username !== 'string' || !Array.isArray(replies)) {
      throw new Error('COMMENT_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = CommentThread;