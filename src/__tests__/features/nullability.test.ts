import deserialize from '../../deserialize'
import JsonProperty from '../../JsonProperty'
import Serializable from '../../Serializable'
import serialize from '../../serialize'

describe('Null and undefined handling', () => {
  @Serializable()
  class Image {
    @JsonProperty()
    url: string
  }

  describe('serialize', () => {
    test('null nested serializable property serializes as null', () => {
      @Serializable()
      class Playlist {
        @JsonProperty({ type: Image })
        cover: Image | null = null
      }

      expect(serialize(new Playlist())).toStrictEqual({ cover: null })
    })

    test('undefined nested serializable property stays undefined', () => {
      @Serializable()
      class Playlist {
        @JsonProperty({ type: Image })
        cover?: Image
      }

      expect(serialize(new Playlist())).toStrictEqual({ cover: undefined })
    })

    test('null array property serializes as null', () => {
      @Serializable()
      class Playlist {
        @JsonProperty({ elementType: Image })
        images: Image[] | null = null
      }

      expect(serialize(new Playlist())).toStrictEqual({ images: null })
    })

    test('null Set property serializes as null', () => {
      @Serializable()
      class Playlist {
        @JsonProperty({ elementType: Image })
        images: Set<Image> | null = null
      }

      expect(serialize(new Playlist())).toStrictEqual({ images: null })
    })

    test('array containing null elements serializes without throwing', () => {
      @Serializable()
      class Playlist {
        @JsonProperty({ elementType: Image })
        images: Array<Image | null>
      }

      const image = new Image()
      image.url = 'imageUrl'

      const playlist = new Playlist()
      playlist.images = [image, null]

      expect(serialize(playlist)).toStrictEqual({
        images: [{ url: 'imageUrl' }, null],
      })
    })

    test('null Date property serializes as null', () => {
      @Serializable()
      class Event {
        @JsonProperty()
        startsAt: Date | null = null
      }

      expect(serialize(new Event())).toStrictEqual({ startsAt: null })
    })
  })

  describe('deserialize', () => {
    test('null json values deserialize to null', () => {
      @Serializable()
      class Playlist {
        @JsonProperty({ type: Image })
        cover: Image | null

        @JsonProperty()
        name: string | null
      }

      const deserialized = deserialize({ cover: null, name: null }, Playlist)
      expect(deserialized.cover).toBeNull()
      expect(deserialized.name).toBeNull()
    })

    test('missing json values leave defaults untouched', () => {
      @Serializable()
      class Playlist {
        @JsonProperty({ type: Image })
        cover: Image | null = null

        @JsonProperty()
        name = 'untitled'
      }

      const deserialized = deserialize({}, Playlist)
      expect(deserialized.cover).toBeNull()
      expect(deserialized.name).toBe('untitled')
    })
  })

  describe('round trip', () => {
    test('null properties survive serialize/deserialize round trip', () => {
      @Serializable()
      class Playlist {
        @JsonProperty({ type: Image })
        cover: Image | null = null

        @JsonProperty()
        name: string | null = null
      }

      const roundTripped = deserialize(serialize(new Playlist()), Playlist)
      expect(roundTripped).toStrictEqual(new Playlist())
    })
  })
})
