import {
  deserialize,
  JsonProperty,
  RequiredPropertyError,
  Serializable,
} from '../../../index'

describe('default values', () => {
  test('applies the default when the json value is missing', () => {
    @Serializable()
    class Playlist {
      @JsonProperty({ default: [] })
      tracks: string[]

      @JsonProperty({ default: 'untitled' })
      name: string
    }

    const playlist = deserialize({}, Playlist)
    expect(playlist.tracks).toStrictEqual([])
    expect(playlist.name).toBe('untitled')
  })

  test('required with default substitutes instead of throwing', () => {
    @Serializable()
    class Playlist {
      @JsonProperty({ required: true, default: 'untitled' })
      name: string
    }

    expect(deserialize({}, Playlist).name).toBe('untitled')
  })

  test('required without default still throws', () => {
    @Serializable()
    class Playlist {
      @JsonProperty({ required: true })
      name: string
    }

    expect(() => deserialize({}, Playlist)).toThrow(RequiredPropertyError)
  })

  test('null is an explicit value and is not replaced', () => {
    @Serializable()
    class Playlist {
      @JsonProperty({ default: 'untitled' })
      name: string | null
    }

    expect(deserialize({ name: null }, Playlist).name).toBeNull()
  })

  test('present json values win over the default', () => {
    @Serializable()
    class Playlist {
      @JsonProperty({ default: 'untitled' })
      name: string
    }

    expect(deserialize({ name: 'mixtape' }, Playlist).name).toBe('mixtape')
  })
})
