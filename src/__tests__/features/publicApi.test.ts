import {
  deserialize,
  JsonProperty,
  RequiredPropertyError,
  Serializable,
  SerializableError,
  serialize,
  ValidatePropertyError,
} from '../../../index'

describe('Public API', () => {
  describe('error classes are exported from the package root', () => {
    test('RequiredPropertyError is thrown and catchable by type', () => {
      @Serializable()
      class Track {
        @JsonProperty({ required: true })
        id: string
      }

      expect(() => deserialize({}, Track)).toThrow(RequiredPropertyError)
    })

    test('ValidatePropertyError is thrown and catchable by type', () => {
      @Serializable()
      class Track {
        @JsonProperty<number>({ validate: (value) => value > 0 })
        duration: number
      }

      expect(() => deserialize({ duration: -1 }, Track)).toThrow(
        ValidatePropertyError
      )
    })

    test('SerializableError is thrown and catchable by type', () => {
      class NotSerializable {
        @JsonProperty()
        id: string
      }

      expect(() => deserialize({}, NotSerializable)).toThrow(SerializableError)
    })
  })

  describe('afterSerialize', () => {
    test('modifies property value after default serialization', () => {
      @Serializable()
      class Event {
        @JsonProperty<Date>({
          afterSerialize: (serializedData: Date) =>
            serializedData.toISOString(),
        })
        startsAt: Date
      }

      const event = new Event()
      event.startsAt = new Date('2026-07-27T12:00:00.000Z')

      expect(serialize(event)).toStrictEqual({
        startsAt: '2026-07-27T12:00:00.000Z',
      })
    })

    test('runs after a custom serialize function', () => {
      @Serializable()
      class Track {
        @JsonProperty<string>({
          serialize: (value: string) => value.toUpperCase(),
          afterSerialize: (serializedData: string) => `${serializedData}!`,
        })
        name: string
      }

      const track = new Track()
      track.name = 'song'

      expect(serialize(track)).toStrictEqual({ name: 'SONG!' })
    })
  })
})
