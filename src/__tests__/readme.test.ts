import { deserialize, JsonProperty, Serializable, serialize } from '../../index'

describe('README quick start', () => {
  const response = {
    track: {
      id: '42',
      album: { images: [{ url: 'https://cover.jpg' }] },
      duration_ms: 235000,
    },
  }

  @Serializable()
  class Track {
    @JsonProperty('track.id')
    id: string

    @JsonProperty('track.album.images[0].url')
    coverUrl: string

    @JsonProperty('track.duration_ms')
    durationMs: number
  }

  test('deserializes the nested response into a flat class', () => {
    const track = deserialize(response, Track)
    expect(track.id).toBe('42')
    expect(track.coverUrl).toBe('https://cover.jpg')
    expect(track.durationMs).toBe(235000)
  })

  test('serialize restores the original nested shape', () => {
    const track = deserialize(response, Track)
    expect(serialize(track)).toStrictEqual(response)
  })
})
