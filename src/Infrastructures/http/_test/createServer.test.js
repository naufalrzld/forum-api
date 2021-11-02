const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const pool = require('../../database/postgres/pool');
const container = require('../../container');
const createServer = require('../createServer');

describe('HTTP server', () => {
  afterAll(async () => {
    await AuthenticationsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  it('should response 404 when request unregistered route', async () => {
    const server = await createServer({});

    const response = await server.inject({
      method: 'GET',
      url: '/unregisteredRoute',
    });

    expect(response.statusCode).toEqual(404);
  });

  describe('when POST /users', () => {
    it('should response 201 and persisted user', async () => {
      const requestPayload = {
        username: 'dicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      };

      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: '/users',
        payload: requestPayload,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedUser).toBeDefined();
    });

    it('should response 400 when request payload not contain needed property', async () => {
      const requestPayload = {
        fullname: 'Dicoding Indonesia',
        password: 'secret',
      };

      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: '/users',
        payload: requestPayload,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat user baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      const requestPayload = {
        username: 'dicoding',
        password: 'secret',
        fullname: ['Dicoding Indonesia'],
      };
      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: '/users',
        payload: requestPayload,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat user baru karena tipe data tidak sesuai');
    });

    it('should response 400 when username more than 50 character', async () => {
      const requestPayload = {
        username: 'dicodingindonesiadicodingindonesiadicodingindonesiadicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      };
      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: '/users',
        payload: requestPayload,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat user baru karena karakter username melebihi batas limit');
    });

    it('should response 400 when username contain restricted character', async () => {
      // Arrange
      const requestPayload = {
        username: 'dicoding indonesia',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      };
      const server = await createServer(container);
      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/users',
        payload: requestPayload,
      });
      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat user baru karena username mengandung karakter terlarang');
    });

    it('should response 400 when username unavailable', async () => {
      // Arrange
      const requestPayload = {
        username: 'dicoding',
        fullname: 'Dicoding Indonesia',
        password: 'super_secret',
      };
      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: '/users',
        payload: requestPayload,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('username tidak tersedia');
    });
  });

  describe('when POST /authentications', () => {
    it('should response 201', async () => {
      const server = await createServer(container);

      const requestPayload = {
        username: 'dicoding',
        password: 'secret',
      };

      const response = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: requestPayload,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.accessToken).toBeDefined();
      expect(responseJson.data.refreshToken).toBeDefined();
    });

    it('should response 400 when user not found', async () => {
      const server = await createServer(container);

      const requestPayload = {
        username: 'dicodings',
        password: 'secret',
      };

      const response = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: requestPayload,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toBeDefined();
      expect(responseJson.message).toEqual('username tidak ditemukan');
    });
  });

  describe('when PUT /authentications', () => {
    it('should response 400 when given invalid token', async () => {
      const server = await createServer(container);

      const payload = {
        refreshToken: 'refresh_token',
      };

      const response = await server.inject({
        method: 'PUT',
        url: '/authentications',
        payload,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toBeDefined();
      expect(responseJson.message).toEqual('refresh token tidak valid');
    });

    it('should response 200 when given valid token', async () => {
      const server = await createServer(container);

      const requestAuthPayload = {
        username: 'dicoding',
        password: 'secret',
      };

      const responseAuth = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: requestAuthPayload,
      });

      const responseAuthJson = JSON.parse(responseAuth.payload);

      const requestRefreshTokenPayload = {
        refreshToken: responseAuthJson.data.refreshToken,
      };

      const responseRefreshToken = await server.inject({
        method: 'PUT',
        url: '/authentications',
        payload: requestRefreshTokenPayload,
      });

      const responseRefreshTokenJson = JSON.parse(responseRefreshToken.payload);
      expect(responseRefreshToken.statusCode).toEqual(200);
      expect(responseRefreshTokenJson.status).toEqual('success');
      expect(responseRefreshTokenJson.data.accessToken).toBeDefined();
    });
  });

  describe('when DELETE /authentications', () => {
    it('should response 400 when given invalid token', async () => {
      const server = await createServer(container);

      const payload = {
        refreshToken: 'refresh_token',
      };

      const response = await server.inject({
        method: 'DELETE',
        url: '/authentications',
        payload,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toBeDefined();
      expect(responseJson.message).toEqual('refresh token tidak ditemukan di database');
    });

    it('should response 200 when given valid token', async () => {
      const server = await createServer(container);

      const requestAuthPayload = {
        username: 'dicoding',
        password: 'secret',
      };

      const responseAuth = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: requestAuthPayload,
      });

      const responseAuthJson = JSON.parse(responseAuth.payload);

      const requestRefreshTokenPayload = {
        refreshToken: responseAuthJson.data.refreshToken,
      };

      const responseDeleteRefreshToken = await server.inject({
        method: 'DELETE',
        url: '/authentications',
        payload: requestRefreshTokenPayload,
      });

      const responseDeleteRefreshTokenJson = JSON.parse(responseDeleteRefreshToken.payload);
      expect(responseDeleteRefreshToken.statusCode).toEqual(200);
      expect(responseDeleteRefreshTokenJson.status).toEqual('success');
      expect(responseDeleteRefreshTokenJson.message).toBeDefined();
      expect(responseDeleteRefreshTokenJson.message).toEqual('refresh token berhasil dihapus');
    });
  });

  describe('threads api', () => {
    let accessToken;
    let threadId;
    let commentId;
    let replyId;

    beforeAll(async () => {
      const server = await createServer(container);

      const responseAuth = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });

      const responseAuthJson = JSON.parse(responseAuth.payload);
      accessToken = responseAuthJson.data.accessToken;

      const payloadAddThread = {
        title: 'thread title',
        body: 'thread body',
      };

      const responseAddThread = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: payloadAddThread,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseAddThreadJson = JSON.parse(responseAddThread.payload);
      threadId = responseAddThreadJson.data.addedThread.id;
    });

    describe('when POST /threads', () => {
      it('should response 400 when not given required property', async () => {
        const server = await createServer(container);

        const payloadAddThread = {
          title: 'thread title',
        };

        const response = await server.inject({
          method: 'POST',
          url: '/threads',
          payload: payloadAddThread,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(400);
        expect(responseJson.status).toEqual('fail');
        expect(responseJson.message).toBeDefined();
      });

      it('should response 401 when not given authentications', async () => {
        const server = await createServer(container);

        const payloadAddThread = {
          title: 'thread title',
        };

        const response = await server.inject({
          method: 'POST',
          url: '/threads',
          payload: payloadAddThread,
        });

        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(401);
        expect(responseJson.message).toBeDefined();
        expect(responseJson.message).toEqual('Missing authentication');
      });

      it('should response 201 when given valid property', async () => {
        const server = await createServer(container);

        const requestAddThread = {
          title: 'thread title',
          body: 'thread body',
        };

        const responseAddThread = await server.inject({
          method: 'POST',
          url: '/threads',
          payload: requestAddThread,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const responseAddThreadJson = JSON.parse(responseAddThread.payload);
        expect(responseAddThread.statusCode).toEqual(201);
        expect(responseAddThreadJson.status).toEqual('success');
        expect(responseAddThreadJson.data.addedThread).toBeDefined();
      });
    });

    describe('when POST /threads/{threadId}/comments', () => {
      it('should response 400 when request payload not cointain needed property', async () => {
        const server = await createServer(container);

        const response = await server.inject({
          method: 'POST',
          url: '/threads/thread-123/comments',
          payload: {},
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(400);
        expect(responseJson.status).toEqual('fail');
        expect(responseJson.message).toBeDefined();
      });

      it('should response 401 when not given authentication', async () => {
        const server = await createServer(container);

        const payload = {
          content: 'thread comment',
        };

        const response = await server.inject({
          method: 'POST',
          url: '/threads/thread-123/comments',
          payload,
        });

        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(401);
        expect(responseJson.message).toEqual('Missing authentication');
      });

      it('should response 404 when thread not available', async () => {
        const server = await createServer(container);

        const payload = {
          content: 'thread comment',
        };

        const response = await server.inject({
          method: 'POST',
          url: '/threads/thread-123/comments',
          payload,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(404);
        expect(responseJson.status).toEqual('fail');
        expect(responseJson.message).toEqual('thread tidak tersedia');
      });

      it('should response 201', async () => {
        const server = await createServer(container);

        const payload = {
          content: 'thread comment',
        };

        const response = await server.inject({
          method: 'POST',
          url: `/threads/${threadId}/comments`,
          payload,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(201);
        expect(responseJson.status).toEqual('success');
        expect(responseJson.data.addedComment).toBeDefined();

        commentId = responseJson.data.addedComment.id;
      });
    });

    describe('when PUT /threads{threadId}/comments/{commentId}/likes', () => {
      it('should response 401 when not given authentication', async () => {
        const server = await createServer(container);

        const response = await server.inject({
          method: 'PUT',
          url: `/threads/${threadId}/comments/${commentId}/likes`,
        });

        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(401);
        expect(responseJson.message).toEqual('Missing authentication');
      });

      it('should response 404 when thread not available', async () => {
        const server = await createServer(container);

        const response = await server.inject({
          method: 'PUT',
          url: `/threads/thread-1234/comments/${commentId}/likes`,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const responseJson = JSON.parse(response.payload);
        expect(responseJson.status).toEqual('fail');
        expect(responseJson.message).toEqual('thread tidak tersedia');
      });

      it('should response 404 when comment not available', async () => {
        const server = await createServer(container);

        const response = await server.inject({
          method: 'PUT',
          url: `/threads/${threadId}/comments/comment-123/likes`,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const responseJson = JSON.parse(response.payload);
        expect(responseJson.status).toEqual('fail');
        expect(responseJson.message).toEqual('comment tidak tersedia');
      });

      it('should response 200 when given valid payload', async () => {
        const server = await createServer(container);

        const response = await server.inject({
          method: 'PUT',
          url: `/threads/${threadId}/comments/${commentId}/likes`,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(200);
        expect(responseJson.status).toEqual('success');
      });
    });

    describe('when POST /threads{threadId}/comments/{commentId}/replies', () => {
      it('should response 400 when request payload not cointain needed property', async () => {
        const server = await createServer(container);

        const response = await server.inject({
          method: 'POST',
          url: '/threads/thread-123/comments/comment-123/replies',
          payload: {},
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(400);
        expect(responseJson.status).toEqual('fail');
        expect(responseJson.message).toBeDefined();
      });

      it('should response 401 when not given authentication', async () => {
        const server = await createServer(container);

        const payload = {
          content: 'reply comment',
        };

        const response = await server.inject({
          method: 'POST',
          url: '/threads/thread-123/comments/comment-123/replies',
          payload,
        });

        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(401);
        expect(responseJson.message).toEqual('Missing authentication');
      });

      it('should response 404 when thread not available', async () => {
        const server = await createServer(container);

        const payload = {
          content: 'reply comment',
        };

        const response = await server.inject({
          method: 'POST',
          url: '/threads/thread-123/comments/comment-123/replies',
          payload,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(404);
        expect(responseJson.status).toEqual('fail');
        expect(responseJson.message).toEqual('thread tidak tersedia');
      });

      it('should response 404 when comment not available', async () => {
        const server = await createServer(container);

        const payload = {
          content: 'reply comment',
        };

        const response = await server.inject({
          method: 'POST',
          url: `/threads/${threadId}/comments/comment-123/replies`,
          payload,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(404);
        expect(responseJson.status).toEqual('fail');
        expect(responseJson.message).toEqual('comment tidak tersedia');
      });

      it('should response 201', async () => {
        const server = await createServer(container);

        const payload = {
          content: 'reply comment',
        };

        const response = await server.inject({
          method: 'POST',
          url: `/threads/${threadId}/comments/${commentId}/replies`,
          payload,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(201);
        expect(responseJson.status).toEqual('success');
        expect(responseJson.data.addedReply).toBeDefined();

        replyId = responseJson.data.addedReply.id;
      });
    });

    describe('when GET /threads/{threadId}', () => {
      it('should response 404 when thread not available', async () => {
        const server = await createServer(container);

        const response = await server.inject({
          method: 'GET',
          url: '/threads/thread-123',
        });

        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(404);
        expect(responseJson.status).toEqual('fail');
        expect(responseJson.message).toBeDefined();
        expect(responseJson.message).toEqual('thread tidak tersedia');
      });

      it('should response 200 when thread available', async () => {
        const server = await createServer(container);

        const response = await server.inject({
          method: 'GET',
          url: `/threads/${threadId}`,
        });

        const responseJson = JSON.parse(response.payload);

        expect(response.statusCode).toEqual(200);
        expect(responseJson.status).toEqual('success');
        expect(responseJson.data.thread).toBeDefined();
        expect(responseJson.data.thread.comments).toBeDefined();
        expect(responseJson.data.thread.comments[0].replies).toBeDefined();
      });
    });

    describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
      it('should response 401 when thread not given authentication', async () => {
        const server = await createServer(container);

        const response = await server.inject({
          method: 'DELETE',
          url: `/threads/${threadId}/comments/${commentId}`,
        });

        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(401);
        expect(responseJson.message).toBeDefined();
        expect(responseJson.message).toEqual('Missing authentication');
      });

      it('should response 403 when given not owned comment', async () => {
        const server = await createServer(container);

        const userPayload = {
          username: 'user01',
          fullname: 'User 1',
          password: 'secret',
        };

        await server.inject({
          method: 'POST',
          url: '/users',
          payload: userPayload,
        });

        const responseAuth = await server.inject({
          method: 'POST',
          url: '/authentications',
          payload: {
            username: userPayload.username,
            password: userPayload.password,
          },
        });

        const responseAuthJson = JSON.parse(responseAuth.payload);

        const response = await server.inject({
          method: 'DELETE',
          url: `/threads/${threadId}/comments/${commentId}`,
          headers: {
            Authorization: `Bearer ${responseAuthJson.data.accessToken}`,
          },
        });

        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(403);
        expect(responseJson.message).toBeDefined();
      });

      it('should response 404 when thread not available', async () => {
        const server = await createServer(container);

        const response = await server.inject({
          method: 'DELETE',
          url: `/threads/thread-123/comments/${commentId}`,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(404);
        expect(responseJson.message).toBeDefined();
        expect(responseJson.message).toEqual('thread tidak tersedia');
      });

      it('should response 404 when comment not available', async () => {
        const server = await createServer(container);

        const response = await server.inject({
          method: 'DELETE',
          url: `/threads/${threadId}/comments/comment-123`,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(404);
        expect(responseJson.message).toBeDefined();
        expect(responseJson.message).toEqual('comment tidak tersedia');
      });

      it('should response 200', async () => {
        const server = await createServer(container);

        const response = await server.inject({
          method: 'DELETE',
          url: `/threads/${threadId}/comments/${commentId}`,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(200);
        expect(responseJson.status).toBeDefined();
        expect(responseJson.status).toEqual('success');
      });
    });

    describe('when DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}', () => {
      it('should response 401 when not given authentication', async () => {
        const server = await createServer(container);

        const response = await server.inject({
          method: 'DELETE',
          url: `/threads/${threadId}/comments/${commentId}/replies/reply-123`,
        });

        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(401);
        expect(responseJson.message).toBeDefined();
        expect(responseJson.message).toEqual('Missing authentication');
      });

      it('should response 403 when given not owned reply', async () => {
        CommentsTableTestHelper.restoreComment(commentId);
        const server = await createServer(container);

        const userPayload = {
          username: 'user01',
          fullname: 'User 1',
          password: 'secret',
        };

        await server.inject({
          method: 'POST',
          url: '/users',
          payload: userPayload,
        });

        const responseAuth = await server.inject({
          method: 'POST',
          url: '/authentications',
          payload: {
            username: userPayload.username,
            password: userPayload.password,
          },
        });

        const responseAuthJson = JSON.parse(responseAuth.payload);

        const response = await server.inject({
          method: 'DELETE',
          url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
          headers: {
            Authorization: `Bearer ${responseAuthJson.data.accessToken}`,
          },
        });

        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(403);
        expect(responseJson.message).toBeDefined();
      });

      it('should response 404 when thread not available', async () => {
        const server = await createServer(container);

        const response = await server.inject({
          method: 'DELETE',
          url: `/threads/thread-123/comments/${commentId}/replies/${replyId}`,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(404);
        expect(responseJson.message).toBeDefined();
        expect(responseJson.message).toEqual('thread tidak tersedia');
      });

      it('should response 404 when comment not available', async () => {
        const server = await createServer(container);

        const response = await server.inject({
          method: 'DELETE',
          url: `/threads/${threadId}/comments/comment-123/replies/${replyId}`,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(404);
        expect(responseJson.message).toBeDefined();
        expect(responseJson.message).toEqual('comment tidak tersedia');
      });

      it('should response 404 when reply not available', async () => {
        const server = await createServer(container);

        const response = await server.inject({
          method: 'DELETE',
          url: `/threads/${threadId}/comments/${commentId}}/replies/reply-123`,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(404);
        expect(responseJson.message).toBeDefined();
        expect(responseJson.message).toEqual('comment tidak tersedia');
      });

      it('should response 200', async () => {
        const server = await createServer(container);

        const response = await server.inject({
          method: 'DELETE',
          url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(200);
        expect(responseJson.status).toBeDefined();
        expect(responseJson.status).toEqual('success');
      });
    });
  });

  it('should handle server error correctly', async () => {
    const requestPayload = {
      username: 'dicoding',
      fullname: 'Dicoding Indonesia',
      password: 'super_secret',
    };
    const server = await createServer({}); // fake container

    const response = await server.inject({
      method: 'POST',
      url: '/users',
      payload: requestPayload,
    });

    const responseJson = JSON.parse(response.payload);
    expect(response.statusCode).toEqual(500);
    expect(responseJson.status).toEqual('error');
    expect(responseJson.message).toEqual('terjadi kegagalan pada server kami');
  });
});