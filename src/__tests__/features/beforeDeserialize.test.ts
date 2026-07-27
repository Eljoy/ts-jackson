import {
  deserialize,
  JsonProperty,
  RequiredPropertyError,
  Serializable,
  TypeMismatchError,
} from '../../../index'

describe('beforeDeserialize', () => {
  test('transforms the raw json value before type conversion', () => {
    @Serializable()
    class Track {
      @JsonProperty<number>({
        beforeDeserialize: (jsonValue: string) =>
          Number.parseInt(jsonValue, 10),
      })
      duration: number
    }

    expect(deserialize({ duration: '90' }, Track).duration).toBe(90)
  })

  test('runs after the required check', () => {
    const beforeDeserialize = jest.fn((jsonValue) => jsonValue)

    @Serializable()
    class Track {
      @JsonProperty({ required: true, beforeDeserialize })
      id: string
    }

    expect(() => deserialize({}, Track)).toThrow(RequiredPropertyError)
    expect(beforeDeserialize).not.toHaveBeenCalled()
  })

  test('runs before strict type checking', () => {
    @Serializable()
    class Track {
      @JsonProperty<number>({
        strict: true,
        beforeDeserialize: (jsonValue: string) => Number(jsonValue),
      })
      duration: number
    }

    expect(deserialize({ duration: '90' }, Track).duration).toBe(90)
  })

  test('strict still rejects values the transform did not fix', () => {
    @Serializable()
    class Track {
      @JsonProperty({
        strict: true,
        beforeDeserialize: (jsonValue) => jsonValue,
      })
      duration: number
    }

    expect(() => deserialize({ duration: '90' }, Track)).toThrow(
      TypeMismatchError
    )
  })

  test('combines with afterDeserialize', () => {
    @Serializable()
    class Track {
      @JsonProperty<string>({
        beforeDeserialize: (jsonValue: string) => jsonValue.trim(),
        afterDeserialize: (_, propertyValue: string) =>
          propertyValue.toUpperCase(),
      })
      name: string
    }

    expect(deserialize({ name: '  song  ' }, Track).name).toBe('SONG')
  })
})
