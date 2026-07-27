import {
  deserialize,
  JsonProperty,
  RequiredPropertyError,
  Serializable,
  SerializableEntity,
  serialize,
} from '../../../index'

describe('TC39 standard decorators', () => {
  @Serializable()
  class Image {
    @JsonProperty({ required: true })
    url: string

    @JsonProperty({ type: Number })
    width: number
  }

  test('path mapping and round trip', () => {
    @Serializable()
    class Track {
      @JsonProperty('track.id')
      id: string

      @JsonProperty()
      name: string
    }

    const json = { track: { id: 'idValue' }, name: 'nameValue' }
    const track = deserialize(json, Track)

    expect(track.id).toBe('idValue')
    expect(track.name).toBe('nameValue')
    expect(serialize(track)).toStrictEqual(json)
  })

  test('explicit type converts values', () => {
    const image = deserialize({ url: 'imageUrl', width: '300' }, Image)
    expect(image.width).toBe(300)
  })

  test('nested serializable with explicit type', () => {
    @Serializable()
    class Playlist {
      @JsonProperty({ type: Image })
      cover: Image
    }

    const playlist = deserialize({ cover: { url: 'coverUrl' } }, Playlist)
    expect(playlist.cover).toBeInstanceOf(Image)
    expect(serialize(playlist)).toStrictEqual({
      cover: { url: 'coverUrl', width: undefined },
    })
  })

  test('elementType implies an array property', () => {
    @Serializable()
    class Playlist {
      @JsonProperty({ elementType: Image })
      images: Image[]
    }

    const playlist = deserialize(
      { images: [{ url: 'first' }, { url: 'second' }] },
      Playlist
    )
    expect(playlist.images).toHaveLength(2)
    expect(playlist.images[0]).toBeInstanceOf(Image)
  })

  test('required property missing throws', () => {
    expect(() => deserialize({}, Image)).toThrow(RequiredPropertyError)
  })

  test('inheritance keeps sibling metadata isolated', () => {
    @Serializable()
    class Profile {
      @JsonProperty()
      id: string
    }

    @Serializable()
    class Manager extends Profile {
      @JsonProperty()
      role: string
    }

    @Serializable()
    class Customer extends Profile {
      @JsonProperty()
      loyaltyPoints: number
    }

    const manager = deserialize({ id: 'idValue', role: 'roleValue' }, Manager)
    expect(serialize(manager)).toStrictEqual({
      id: 'idValue',
      role: 'roleValue',
    })

    const customer = new Customer()
    customer.id = 'customerId'
    customer.loyaltyPoints = 3
    expect(serialize(customer)).toStrictEqual({
      id: 'customerId',
      loyaltyPoints: 3,
    })
  })

  test('SerializableEntity subclass', () => {
    class Token extends SerializableEntity {
      @JsonProperty({ path: 'access_token', required: true })
      accessToken: string
    }

    const token = Token.deserialize({ access_token: 'tokenValue' })
    expect(token.accessToken).toBe('tokenValue')
    expect(token.serialize()).toStrictEqual({ access_token: 'tokenValue' })
  })

  test('Map property with explicit type', () => {
    @Serializable()
    class Gallery {
      @JsonProperty({ type: Map, elementType: Image })
      imagesBySize: Map<string, Image>
    }

    const gallery = deserialize(
      { imagesBySize: { small: { url: 'smallUrl' } } },
      Gallery
    )
    expect(gallery.imagesBySize).toBeInstanceOf(Map)
    expect(gallery.imagesBySize.get('small')).toBeInstanceOf(Image)
  })

  test('dictionary property with explicit Object type', () => {
    @Serializable()
    class Gallery {
      @JsonProperty({ type: Object, elementType: Image })
      imagesBySize: Record<string, Image>
    }

    const gallery = deserialize(
      { imagesBySize: { small: { url: 'smallUrl' } } },
      Gallery
    )
    expect(gallery.imagesBySize.small).toBeInstanceOf(Image)
  })

  test('formatPropertyName naming strategy', () => {
    @Serializable({
      formatPropertyName: (name) =>
        name.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`),
    })
    class Token {
      @JsonProperty()
      accessToken: string
    }

    const token = deserialize({ access_token: 'tokenValue' }, Token)
    expect(token.accessToken).toBe('tokenValue')
    expect(serialize(token)).toStrictEqual({ access_token: 'tokenValue' })
  })

  test('untyped primitive is not coerced without design:type emission', () => {
    @Serializable()
    class Counter {
      @JsonProperty()
      count: number
    }

    expect(deserialize({ count: '5' }, Counter).count).toBe('5')
  })

  test('untyped property passes the raw json value through', () => {
    @Serializable()
    class Raw {
      @JsonProperty()
      payload: { nested: string }
    }

    const raw = deserialize({ payload: { nested: 'value' } }, Raw)
    expect(raw.payload).toStrictEqual({ nested: 'value' })
    expect(serialize(raw)).toStrictEqual({ payload: { nested: 'value' } })
  })
})
