import {
  deserialize,
  JsonProperty,
  Serializable,
  serialize,
} from '../../../index'

const camelToSnakeCase = (propertyName: string) =>
  propertyName.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)

describe('formatPropertyName', () => {
  @Serializable({ formatPropertyName: camelToSnakeCase })
  class Token {
    @JsonProperty()
    accessToken: string

    @JsonProperty()
    expiresIn: number
  }

  const json = { access_token: 'tokenValue', expires_in: 3600 }

  test('deserializes using formatted property names', () => {
    const token = deserialize(json, Token)
    expect(token.accessToken).toBe('tokenValue')
    expect(token.expiresIn).toBe(3600)
  })

  test('serializes back to formatted names', () => {
    const token = deserialize(json, Token)
    expect(serialize(token)).toStrictEqual(json)
  })

  test('explicit path wins over the naming strategy', () => {
    @Serializable({ formatPropertyName: camelToSnakeCase })
    class Track {
      @JsonProperty('track.id')
      trackId: string
    }

    const track = deserialize({ track: { id: 'idValue' } }, Track)
    expect(track.trackId).toBe('idValue')
    expect(serialize(track)).toStrictEqual({ track: { id: 'idValue' } })
  })

  test('required error reports the formatted path', () => {
    @Serializable({ formatPropertyName: camelToSnakeCase })
    class Strict {
      @JsonProperty({ required: true })
      accessToken: string
    }

    expect(() => deserialize({}, Strict)).toThrow(/access_token/)
  })

  test('subclasses inherit the naming strategy', () => {
    @Serializable()
    class RefreshableToken extends Token {
      @JsonProperty()
      refreshToken: string
    }

    const refreshable = deserialize(
      { ...json, refresh_token: 'refreshValue' },
      RefreshableToken
    )
    expect(refreshable.accessToken).toBe('tokenValue')
    expect(refreshable.refreshToken).toBe('refreshValue')
  })

  test('subclasses can override the naming strategy', () => {
    @Serializable({ formatPropertyName: (name) => name.toUpperCase() })
    class ShoutingToken extends Token {
      @JsonProperty()
      refreshToken: string
    }

    const shouting = deserialize(
      { REFRESHTOKEN: 'refreshValue', ACCESSTOKEN: 'tokenValue' },
      ShoutingToken
    )
    expect(shouting.refreshToken).toBe('refreshValue')
    expect(shouting.accessToken).toBe('tokenValue')
  })

  test('classes without a strategy keep property-name paths', () => {
    @Serializable()
    class Plain {
      @JsonProperty()
      accessToken: string
    }

    const plain = deserialize({ accessToken: 'tokenValue' }, Plain)
    expect(plain.accessToken).toBe('tokenValue')
  })
})
