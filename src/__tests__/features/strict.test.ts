import {
  deserialize,
  JsonProperty,
  RequiredPropertyError,
  Serializable,
  TypeMismatchError,
} from '../../../index'

describe('Strict type checking', () => {
  @Serializable()
  class Person {
    @JsonProperty({ strict: true })
    age: number

    @JsonProperty({ strict: true })
    name: string

    @JsonProperty({ strict: true })
    active: boolean
  }

  test('matching primitive types pass', () => {
    const person = deserialize({ age: 30, name: 'John', active: true }, Person)
    expect(person.age).toBe(30)
    expect(person.name).toBe('John')
    expect(person.active).toBe(true)
  })

  test('string json value for a number property throws', () => {
    expect(() => deserialize({ age: '30' }, Person)).toThrow(TypeMismatchError)
    expect(() => deserialize({ age: '30' }, Person)).toThrow(
      /age.*expected Number.*received string/
    )
  })

  test('number json value for a string property throws', () => {
    expect(() => deserialize({ name: 42 }, Person)).toThrow(TypeMismatchError)
  })

  test('numeric json value for a boolean property throws', () => {
    expect(() => deserialize({ active: 1 }, Person)).toThrow(TypeMismatchError)
  })

  test('null and missing values pass strict checks', () => {
    expect(() => deserialize({ age: null }, Person)).not.toThrow()
    expect(() => deserialize({}, Person)).not.toThrow()
  })

  test('without strict the value is coerced as before', () => {
    @Serializable()
    class Loose {
      @JsonProperty()
      age: number
    }

    expect(deserialize({ age: '30' }, Loose).age).toBe(30)
  })

  describe('Date properties', () => {
    @Serializable()
    class Event {
      @JsonProperty({ strict: true })
      startsAt: Date
    }

    test('valid ISO string passes', () => {
      const event = deserialize({ startsAt: '2026-07-27T12:00:00.000Z' }, Event)
      expect(event.startsAt).toBeInstanceOf(Date)
    })

    test('unparsable date string throws', () => {
      expect(() => deserialize({ startsAt: 'not a date' }, Event)).toThrow(
        TypeMismatchError
      )
    })

    test('boolean json value throws', () => {
      expect(() => deserialize({ startsAt: true }, Event)).toThrow(
        TypeMismatchError
      )
    })
  })

  describe('collections', () => {
    @Serializable()
    class Stats {
      @JsonProperty({ elementType: Number, strict: true })
      values: number[]
    }

    test('homogeneous array passes', () => {
      expect(deserialize({ values: [1, 2, 3] }, Stats).values).toStrictEqual([
        1, 2, 3,
      ])
    })

    test('mistyped element throws', () => {
      expect(() => deserialize({ values: [1, '2', 3] }, Stats)).toThrow(
        TypeMismatchError
      )
    })
  })

  describe('nested serializable', () => {
    @Serializable()
    class Image {
      @JsonProperty()
      url: string
    }

    @Serializable()
    class Playlist {
      @JsonProperty({ type: Image, strict: true })
      cover: Image
    }

    test('object json passes', () => {
      expect(() =>
        deserialize({ cover: { url: 'coverUrl' } }, Playlist)
      ).not.toThrow()
    })

    test('primitive json throws', () => {
      expect(() => deserialize({ cover: 'coverUrl' }, Playlist)).toThrow(
        TypeMismatchError
      )
    })
  })

  test('required is checked before strict', () => {
    @Serializable()
    class Track {
      @JsonProperty({ required: true, strict: true })
      id: string
    }

    expect(() => deserialize({}, Track)).toThrow(RequiredPropertyError)
    expect(() => deserialize({ id: 42 }, Track)).toThrow(TypeMismatchError)
  })

  test('custom deserialize bypasses strict checks', () => {
    @Serializable()
    class Track {
      @JsonProperty<number>({
        strict: true,
        deserialize: (jsonValue: string) => parseInt(jsonValue, 10),
      })
      duration: number
    }

    expect(deserialize({ duration: '90' }, Track).duration).toBe(90)
  })
})
