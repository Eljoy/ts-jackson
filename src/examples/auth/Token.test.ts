import { serialize } from '../../../index'
import Token from './Token'

describe('Token', () => {
  it('should throw Error if provided data for serialization if incorrect', () => {
    expect(() => Token.deserialize({ access_token: undefined })).toThrow()
  })

  const tokenJSON = {
    access_token: '234dewwf',
    refresh_token: '2fed2oekio2',
    expires_in: 3600,
    token_type: 'Bearer',
  }

  test('deserialize', () => {
    const token = Token.deserialize(tokenJSON)
    expect(token).toMatchObject({
      accessToken: tokenJSON.access_token,
      refreshToken: tokenJSON.refresh_token,
      expiresIn: tokenJSON.expires_in,
      tokenType: tokenJSON.token_type,
    })
  })

  test('serialize', () => {
    const token = Token.deserialize(tokenJSON)
    expect(serialize(token)).toMatchObject(tokenJSON)
  })
})
