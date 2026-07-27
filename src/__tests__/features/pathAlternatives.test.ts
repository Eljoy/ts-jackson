import {
  deserialize,
  JsonProperty,
  RequiredPropertyError,
  Serializable,
  serialize,
} from '../../../index'

describe('Path alternatives', () => {
  @Serializable()
  class Dog {
    @JsonProperty({ pathAlternatives: ['treat', 'goodie'] })
    snack: string
  }

  test('resolves the first alternative present in json', () => {
    expect(deserialize({ treat: 'bone' }, Dog).snack).toBe('bone')
  })

  test('falls back to the next alternative', () => {
    expect(deserialize({ goodie: 'chew toy' }, Dog).snack).toBe('chew toy')
  })

  test('primary path wins over alternatives', () => {
    const json = { snack: 'sausage', treat: 'bone', goodie: 'chew toy' }
    expect(deserialize(json, Dog).snack).toBe('sausage')
  })

  test('null alternatives are skipped', () => {
    expect(deserialize({ treat: null, goodie: 'chew toy' }, Dog).snack).toBe(
      'chew toy'
    )
  })

  test('explicit path is tried before alternatives', () => {
    @Serializable()
    class Track {
      @JsonProperty({ path: 'track.id', pathAlternatives: ['trackId', 'id'] })
      id: string
    }

    expect(deserialize({ track: { id: 'nested' } }, Track).id).toBe('nested')
    expect(deserialize({ trackId: 'flat' }, Track).id).toBe('flat')
    expect(deserialize({ id: 'plain' }, Track).id).toBe('plain')
  })

  test('serialize writes to the primary path enabling round trips', () => {
    const dog = deserialize({ goodie: 'chew toy' }, Dog)
    const json = serialize(dog)
    expect(json).toStrictEqual({ snack: 'chew toy' })
    expect(deserialize(json, Dog)).toStrictEqual(dog)
  })

  test('missing value across all alternatives leaves property undefined', () => {
    expect(deserialize({}, Dog).snack).toBeUndefined()
  })

  test('required property missing in all alternatives throws', () => {
    @Serializable()
    class StrictDog {
      @JsonProperty({ pathAlternatives: ['treat', 'goodie'], required: true })
      snack: string
    }

    expect(() => deserialize({}, StrictDog)).toThrow(RequiredPropertyError)
  })

  test('alternatives combine with nested serializable types', () => {
    @Serializable()
    class Image {
      @JsonProperty()
      url: string
    }

    @Serializable()
    class Playlist {
      @JsonProperty({ pathAlternatives: ['icon', 'thumbnail'], type: Image })
      cover: Image
    }

    const deserialized = deserialize(
      { thumbnail: { url: 'thumbUrl' } },
      Playlist
    )
    expect(deserialized.cover).toBeInstanceOf(Image)
    expect(deserialized.cover.url).toBe('thumbUrl')
  })
})
