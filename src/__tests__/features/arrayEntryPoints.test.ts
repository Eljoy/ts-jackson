import {
  deserializeArray,
  JsonProperty,
  Serializable,
  serializeArray,
} from '../../../index'

describe('Array entry points', () => {
  @Serializable()
  class Track {
    @JsonProperty('track.id')
    id: string
  }

  const json = [{ track: { id: 'first' } }, { track: { id: 'second' } }]

  test('deserializeArray maps each item to a class instance', () => {
    const tracks = deserializeArray(json, Track)
    expect(tracks).toHaveLength(2)
    expect(tracks[0]).toBeInstanceOf(Track)
    expect(tracks[0].id).toBe('first')
    expect(tracks[1].id).toBe('second')
  })

  test('deserializeArray accepts a json string', () => {
    const tracks = deserializeArray(JSON.stringify(json), Track)
    expect(tracks.map((track) => track.id)).toStrictEqual(['first', 'second'])
  })

  test('deserializeArray passes constructor arguments to every instance', () => {
    @Serializable()
    class Dog {
      @JsonProperty()
      name: string

      constructor(readonly owner: string) {}
    }

    const dogs = deserializeArray(
      [{ name: 'Scooby Doo' }, { name: 'Scrappy Doo' }],
      Dog,
      'Shaggy'
    )
    expect(dogs.every((dog) => dog.owner === 'Shaggy')).toBe(true)
  })

  test('deserializeArray throws on non-array json', () => {
    expect(() =>
      deserializeArray({ track: { id: 'first' } } as never, Track)
    ).toThrow(/deserializeArray expects an array/)
  })

  test('serializeArray maps instances back to json', () => {
    const tracks = deserializeArray(json, Track)
    expect(serializeArray(tracks)).toStrictEqual(json)
  })

  test('serializeArray of an empty array returns an empty array', () => {
    expect(serializeArray([])).toStrictEqual([])
  })
})
