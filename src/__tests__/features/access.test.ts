import {
  deserialize,
  JsonProperty,
  Serializable,
  serialize,
} from '../../../index'

describe('access control', () => {
  @Serializable()
  class User {
    @JsonProperty({ access: 'deserialize-only' })
    id: string

    @JsonProperty()
    name: string

    @JsonProperty({ access: 'serialize-only' })
    password: string
  }

  test('deserialize-only properties are read from json', () => {
    const user = deserialize({ id: 'serverId', name: 'John' }, User)
    expect(user.id).toBe('serverId')
  })

  test('deserialize-only properties are omitted from serialized json', () => {
    const user = deserialize({ id: 'serverId', name: 'John' }, User)
    const json = serialize(user)
    expect('id' in json).toBe(false)
    expect(json.name).toBe('John')
  })

  test('serialize-only properties are written to json', () => {
    const user = new User()
    user.name = 'John'
    user.password = 'secret'
    expect(serialize(user)).toStrictEqual({
      name: 'John',
      password: 'secret',
    })
  })

  test('serialize-only properties are ignored during deserialization', () => {
    const user = deserialize({ name: 'John', password: 'injected' }, User)
    expect(user.password).toBeUndefined()
  })
})
