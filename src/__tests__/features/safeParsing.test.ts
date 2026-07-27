import {
  deserialize,
  JsonProperty,
  RequiredPropertyError,
  safeDeserialize,
  safeDeserializeArray,
  safeSerialize,
  Serializable,
  SerializableError,
  serialize,
  TypeMismatchError,
} from '../../../index'

describe('Safe parsing', () => {
  @Serializable()
  class Track {
    @JsonProperty({ required: true })
    id: string

    @JsonProperty({ strict: true })
    duration: number

    @JsonProperty({ required: true })
    name: string
  }

  describe('safeDeserialize', () => {
    test('returns success with the deserialized instance', () => {
      const result = safeDeserialize(
        { id: 'idValue', duration: 90, name: 'song' },
        Track
      )
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toBeInstanceOf(Track)
        expect(result.data.id).toBe('idValue')
      }
    })

    test('collects every property error instead of stopping at the first', () => {
      const result = safeDeserialize({ duration: '90' }, Track)
      expect(result.success).toBe(false)
      if (result.success === false) {
        expect(result.errors).toHaveLength(3)
        expect(result.errors[0]).toBeInstanceOf(RequiredPropertyError)
        expect(result.errors[1]).toBeInstanceOf(TypeMismatchError)
        expect(result.errors[2]).toBeInstanceOf(RequiredPropertyError)
      }
    })

    test('captures invalid json string input', () => {
      const result = safeDeserialize('{not json', Track)
      expect(result.success).toBe(false)
      if (result.success === false) {
        expect(result.errors[0]).toBeInstanceOf(SyntaxError)
      }
    })

    test('captures non-serializable classes', () => {
      class Plain {}
      const result = safeDeserialize({}, Plain)
      expect(result.success).toBe(false)
      if (result.success === false) {
        expect(result.errors[0]).toBeInstanceOf(SerializableError)
      }
    })

    test('throwing deserialize entry point is unchanged', () => {
      expect(() => deserialize({}, Track)).toThrow(RequiredPropertyError)
    })
  })

  describe('safeDeserializeArray', () => {
    test('returns success for a valid array', () => {
      const result = safeDeserializeArray(
        [
          { id: 'a', name: 'first' },
          { id: 'b', name: 'second' },
        ],
        Track
      )
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.map((track) => track.id)).toStrictEqual(['a', 'b'])
      }
    })

    test('collects errors across all items', () => {
      const result = safeDeserializeArray(
        [{ id: 'a', name: 'first' }, { name: 'second' }, { id: 'c' }],
        Track
      )
      expect(result.success).toBe(false)
      if (result.success === false) {
        expect(result.errors).toHaveLength(2)
        expect(
          result.errors.every((error) => error instanceof RequiredPropertyError)
        ).toBe(true)
      }
    })

    test('captures non-array input', () => {
      const result = safeDeserializeArray({} as never, Track)
      expect(result.success).toBe(false)
      if (result.success === false) {
        expect(result.errors[0]).toBeInstanceOf(TypeError)
      }
    })
  })

  describe('safeSerialize', () => {
    test('returns success with the serialized json', () => {
      const track = deserialize(
        { id: 'idValue', duration: 90, name: 'song' },
        Track
      )
      const result = safeSerialize(track)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toStrictEqual(serialize(track))
      }
    })

    test('collects errors thrown by property hooks', () => {
      @Serializable()
      class Broken {
        @JsonProperty({
          beforeSerialize: () => {
            throw new Error('first hook failed')
          },
        })
        first: string

        @JsonProperty({
          beforeSerialize: () => {
            throw new Error('second hook failed')
          },
        })
        second: string

        @JsonProperty()
        untouched = 'fine'
      }

      const result = safeSerialize(new Broken())
      expect(result.success).toBe(false)
      if (result.success === false) {
        expect(result.errors.map((error) => error.message)).toStrictEqual([
          'first hook failed',
          'second hook failed',
        ])
      }
    })

    test('captures non-serializable instances', () => {
      class Plain {}
      const result = safeSerialize(new Plain())
      expect(result.success).toBe(false)
      if (result.success === false) {
        expect(result.errors[0]).toBeInstanceOf(SerializableError)
      }
    })
  })
})
