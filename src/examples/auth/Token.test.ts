import Token from './Token'

describe('Token', () => {
  it('should throw Error if provided data for serialization if incorrect', () => {
    expect(() => Token.deserialize({ access_token: undefined })).toThrow()
  })

  const tokenJSON = {
    access_token: '234dewwf',
    refresh_token: '2fed2oekio2',
    expires_in: 2,
    token_type: 'Bearer',
  }

  it('should correctly deserialize to Token when proper data is provided', () => {
    const token = Token.deserialize(tokenJSON)
    expect(token).toMatchObject({
      accessToken: tokenJSON.access_token,
      refreshToken: tokenJSON.refresh_token,
      expiresIn: tokenJSON.expires_in,
      tokenType: tokenJSON.token_type,
    })
  })
})
