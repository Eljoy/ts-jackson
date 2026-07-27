import {
  camelToKebabCase,
  camelToPascalCase,
  camelToSnakeCase,
  deserialize,
  JsonProperty,
  Serializable,
  serialize,
} from '../index'

describe('naming strategies', () => {
  describe('camelToSnakeCase', () => {
    test.each([
      ['accessToken', 'access_token'],
      ['expiresIn', 'expires_in'],
      ['name', 'name'],
      ['accessURLPath', 'access_url_path'],
      ['address1Line', 'address1_line'],
    ])('%s -> %s', (input, expected) => {
      expect(camelToSnakeCase(input)).toBe(expected)
    })
  })

  describe('camelToKebabCase', () => {
    test.each([
      ['accessToken', 'access-token'],
      ['accessURLPath', 'access-url-path'],
      ['name', 'name'],
    ])('%s -> %s', (input, expected) => {
      expect(camelToKebabCase(input)).toBe(expected)
    })
  })

  describe('camelToPascalCase', () => {
    test.each([
      ['accessToken', 'AccessToken'],
      ['name', 'Name'],
    ])('%s -> %s', (input, expected) => {
      expect(camelToPascalCase(input)).toBe(expected)
    })
  })

  test('used as a formatPropertyName strategy', () => {
    @Serializable({ formatPropertyName: camelToSnakeCase })
    class Token {
      @JsonProperty()
      accessToken: string

      @JsonProperty()
      expiresIn: number
    }

    const json = { access_token: 'tokenValue', expires_in: 3600 }
    const token = deserialize(json, Token)
    expect(token.accessToken).toBe('tokenValue')
    expect(token.expiresIn).toBe(3600)
    expect(serialize(token)).toStrictEqual(json)
  })
})
