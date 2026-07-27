import {
  deserialize,
  JsonProperty,
  Serializable,
  serialize,
  TypeMismatchError,
} from '../../../index'

describe('Maps and dictionaries', () => {
  @Serializable()
  class Image {
    @JsonProperty()
    url: string
  }

  describe('Map properties', () => {
    @Serializable()
    class Gallery {
      @JsonProperty({ elementType: Image })
      imagesBySize: Map<string, Image>
    }

    const json = {
      imagesBySize: {
        small: { url: 'smallUrl' },
        big: { url: 'bigUrl' },
      },
    }

    test('deserializes json object into a Map of typed values', () => {
      const gallery = deserialize(json, Gallery)
      expect(gallery.imagesBySize).toBeInstanceOf(Map)
      expect(gallery.imagesBySize.size).toBe(2)
      expect(gallery.imagesBySize.get('small')).toBeInstanceOf(Image)
      expect(gallery.imagesBySize.get('big').url).toBe('bigUrl')
    })

    test('serializes a Map back to a json object', () => {
      const gallery = deserialize(json, Gallery)
      expect(serialize(gallery)).toStrictEqual(json)
    })

    test('Map of primitives works without elementType', () => {
      @Serializable()
      class Scores {
        @JsonProperty()
        byPlayer: Map<string, number>
      }

      const scores = deserialize({ byPlayer: { alice: 3, bob: 5 } }, Scores)
      expect(scores.byPlayer.get('alice')).toBe(3)
      expect(serialize(scores)).toStrictEqual({
        byPlayer: { alice: 3, bob: 5 },
      })
    })

    test('non-object json for a Map property throws', () => {
      expect(() => deserialize({ imagesBySize: [1, 2] }, Gallery)).toThrow(
        /imagesBySize.*Map.*object/i
      )
    })
  })

  describe('dictionary properties', () => {
    @Serializable()
    class Gallery {
      @JsonProperty({ elementType: Image })
      imagesBySize: Record<string, Image>
    }

    const json = {
      imagesBySize: {
        small: { url: 'smallUrl' },
        big: { url: 'bigUrl' },
      },
    }

    test('deserializes values into class instances keyed as provided', () => {
      const gallery = deserialize(json, Gallery)
      expect(gallery.imagesBySize.small).toBeInstanceOf(Image)
      expect(gallery.imagesBySize.big.url).toBe('bigUrl')
    })

    test('round trips through serialize', () => {
      const gallery = deserialize(json, Gallery)
      expect(serialize(gallery)).toStrictEqual(json)
    })

    test('plain object property without elementType stays raw', () => {
      @Serializable()
      class Config {
        @JsonProperty()
        options: Record<string, unknown>
      }

      const config = deserialize(
        { options: { retries: 3, verbose: true } },
        Config
      )
      expect(config.options).toStrictEqual({ retries: 3, verbose: true })
    })
  })

  describe('strict mode', () => {
    @Serializable()
    class Scores {
      @JsonProperty({ elementType: Number, strict: true })
      byPlayer: Map<string, number>
    }

    test('matching value types pass', () => {
      expect(() =>
        deserialize({ byPlayer: { alice: 3 } }, Scores)
      ).not.toThrow()
    })

    test('mistyped dictionary value throws', () => {
      expect(() => deserialize({ byPlayer: { alice: '3' } }, Scores)).toThrow(
        TypeMismatchError
      )
    })
  })

  describe('polymorphic values', () => {
    @Serializable()
    class Shape {}

    @Serializable()
    class Circle extends Shape {
      @JsonProperty()
      radius: number
    }

    @Serializable()
    class Square extends Shape {
      @JsonProperty()
      side: number
    }

    test('resolveType applies per dictionary value', () => {
      @Serializable()
      class Canvas {
        @JsonProperty({
          elementType: Shape,
          resolveType: (json) => ('radius' in json ? Circle : Square),
        })
        shapes: Map<string, Shape>
      }

      const canvas = deserialize(
        { shapes: { first: { radius: 2 }, second: { side: 4 } } },
        Canvas
      )
      expect(canvas.shapes.get('first')).toBeInstanceOf(Circle)
      expect(canvas.shapes.get('second')).toBeInstanceOf(Square)
    })
  })
})
