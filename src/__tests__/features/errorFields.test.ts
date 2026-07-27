import {
  deserialize,
  isTsJacksonError,
  JsonProperty,
  RequiredPropertyError,
  safeDeserialize,
  Serializable,
  SerializableError,
  serialize,
  TypeMismatchError,
  ValidatePropertyError,
} from '../../../index'

describe('Structured error fields', () => {
  @Serializable()
  class Track {
    @JsonProperty({ path: 'track.id', required: true })
    id: string

    @JsonProperty({ strict: true })
    duration: number

    @JsonProperty<number>({ validate: (value) => value > 0 })
    plays: number
  }

  test('RequiredPropertyError carries kind, property, path and class', () => {
    try {
      deserialize({}, Track)
      throw new Error('expected to throw')
    } catch (error) {
      const requiredError = error as RequiredPropertyError
      expect(requiredError.kind).toBe('required')
      expect(requiredError.propertyName).toBe('id')
      expect(requiredError.path).toBe('track.id')
      expect(requiredError.className).toBe('Track')
    }
  })

  test('TypeMismatchError carries expected type and offending value', () => {
    try {
      deserialize({ track: { id: 'a' }, duration: '90' }, Track)
      throw new Error('expected to throw')
    } catch (error) {
      const mismatchError = error as TypeMismatchError
      expect(mismatchError.kind).toBe('type-mismatch')
      expect(mismatchError.propertyName).toBe('duration')
      expect(mismatchError.path).toBe('duration')
      expect(mismatchError.className).toBe('Track')
      expect(mismatchError.expected).toBe('Number')
      expect(mismatchError.value).toBe('90')
    }
  })

  test('collection shape mismatch is a TypeMismatchError too', () => {
    @Serializable()
    class Playlist {
      @JsonProperty()
      images: string[]
    }

    try {
      deserialize({ images: 'oops' }, Playlist)
      throw new Error('expected to throw')
    } catch (error) {
      const mismatchError = error as TypeMismatchError
      expect(mismatchError).toBeInstanceOf(TypeMismatchError)
      expect(mismatchError.kind).toBe('type-mismatch')
      expect(mismatchError.propertyName).toBe('images')
      expect(mismatchError.expected).toBe('Array')
      expect(mismatchError.value).toBe('oops')
    }
  })

  test('ValidatePropertyError carries the rejected value', () => {
    try {
      deserialize({ track: { id: 'a' }, plays: -1 }, Track)
      throw new Error('expected to throw')
    } catch (error) {
      const validationError = error as ValidatePropertyError
      expect(validationError.kind).toBe('validation')
      expect(validationError.propertyName).toBe('plays')
      expect(validationError.className).toBe('Track')
      expect(validationError.value).toBe(-1)
    }
  })

  test('SerializableError carries the class name', () => {
    class Plain {}
    try {
      serialize(new Plain())
      throw new Error('expected to throw')
    } catch (error) {
      const serializableError = error as SerializableError
      expect(serializableError.kind).toBe('not-serializable')
      expect(serializableError.className).toBe('Plain')
    }
  })

  test('isTsJacksonError narrows and kind discriminates in safe results', () => {
    const result = safeDeserialize({ duration: '90', plays: -1 }, Track)
    expect(result.success).toBe(false)
    if (result.success === false) {
      const libraryErrors = result.errors.filter(isTsJacksonError)
      expect(libraryErrors).toHaveLength(3)
      expect(libraryErrors.map((error) => error.kind)).toStrictEqual([
        'required',
        'type-mismatch',
        'validation',
      ])
    }
  })
})
