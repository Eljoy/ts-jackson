import deserialize from '../../deserialize'
import JsonProperty from '../../JsonProperty'
import Serializable from '../../Serializable'

describe('Malformed input', () => {
  @Serializable()
  class Image {
    @JsonProperty()
    url: string
  }

  test('non-array json for an Array-typed property throws a descriptive error', () => {
    @Serializable()
    class Playlist {
      @JsonProperty({ elementType: Image })
      images: Image[]
    }

    expect(() => deserialize({ images: 'oops' }, Playlist)).toThrow(
      /images.*array.*string/i
    )
  })

  test('non-array json for a Set-typed property throws a descriptive error', () => {
    @Serializable()
    class Playlist {
      @JsonProperty({ elementType: Image })
      images: Set<Image>
    }

    expect(() => deserialize({ images: 42 }, Playlist)).toThrow(
      /images.*Set.*number/i
    )
  })

  test('object json for an Array-typed property throws a descriptive error', () => {
    @Serializable()
    class Playlist {
      @JsonProperty({ elementType: Image })
      images: Image[]
    }

    expect(() =>
      deserialize({ images: { url: 'imageUrl' } }, Playlist)
    ).toThrow(/images.*array/i)
  })

  test('invalid json string input throws SyntaxError', () => {
    @Serializable()
    class Playlist {
      @JsonProperty()
      name: string
    }

    expect(() => deserialize('{not json', Playlist)).toThrow(SyntaxError)
  })
})
