const AuthorizationError = require('../AuthorizationError');

describe('AuthorizationError', () => {
  it('should create AuthorizationError correctly', () => {
    const authorizationError = new AuthorizationError('authorizationError error!');

    expect(authorizationError.statusCode).toEqual(403);
    expect(authorizationError.message).toEqual('authorizationError error!');
    expect(authorizationError.name).toEqual('AuthorizationError');
  });
});