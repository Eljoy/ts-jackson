import {
  deserialize,
  JsonProperty,
  Serializable,
  serialize,
} from '../../../index'

describe('Polymorphism', () => {
  @Serializable()
  class Polymorphic {}

  @Serializable()
  class PolyA extends Polymorphic {
    @JsonProperty()
    name = 'PolyA'

    @JsonProperty()
    isSomething = false
  }

  @Serializable()
  class PolyB extends Polymorphic {
    @JsonProperty()
    name = 'PolyB'

    @JsonProperty()
    value = 50
  }

  describe('issue #8 example', () => {
    @Serializable()
    class HasPolymorphic {
      @JsonProperty({
        elementType: Polymorphic,
        resolveType: (json) => (json.name === 'PolyA' ? PolyA : PolyB),
      })
      polys: Polymorphic[] = []
    }

    test('serializes mixed subclass instances by their runtime type', () => {
      const instance = new HasPolymorphic()
      instance.polys.push(new PolyA())
      instance.polys.push(new PolyB())

      expect(serialize(instance)).toStrictEqual({
        polys: [
          { name: 'PolyA', isSomething: false },
          { name: 'PolyB', value: 50 },
        ],
      })
    })

    test('deserializes elements to concrete subclasses via resolveType', () => {
      const instance = new HasPolymorphic()
      instance.polys.push(new PolyA())
      instance.polys.push(new PolyB())

      const deserialized = deserialize(serialize(instance), HasPolymorphic)

      expect(deserialized.polys[0]).toBeInstanceOf(PolyA)
      expect(deserialized.polys[1]).toBeInstanceOf(PolyB)
      expect(deserialized).toStrictEqual(instance)
    })
  })

  test('resolveType on a single nested property', () => {
    @Serializable()
    class Holder {
      @JsonProperty({
        type: Polymorphic,
        resolveType: (json) => (json.name === 'PolyA' ? PolyA : PolyB),
      })
      poly: Polymorphic
    }

    const deserialized = deserialize({ poly: { name: 'PolyB' } }, Holder)
    expect(deserialized.poly).toBeInstanceOf(PolyB)
    expect((deserialized.poly as PolyB).value).toBe(50)
  })

  test('resolveType on a Set property', () => {
    @Serializable()
    class Holder {
      @JsonProperty({
        elementType: Polymorphic,
        resolveType: (json) => (json.name === 'PolyA' ? PolyA : PolyB),
      })
      polys: Set<Polymorphic>
    }

    const deserialized = deserialize(
      { polys: [{ name: 'PolyA' }, { name: 'PolyB' }] },
      Holder
    )
    const [first, second] = Array.from(deserialized.polys)
    expect(first).toBeInstanceOf(PolyA)
    expect(second).toBeInstanceOf(PolyB)
  })

  test('resolveType falling back to elementType when returning undefined', () => {
    @Serializable()
    class Holder {
      @JsonProperty({
        elementType: PolyA,
        resolveType: (json) => (json.name === 'PolyB' ? PolyB : undefined),
      })
      polys: Polymorphic[]
    }

    const deserialized = deserialize(
      { polys: [{ name: 'PolyA' }, { name: 'PolyB' }] },
      Holder
    )
    expect(deserialized.polys[0]).toBeInstanceOf(PolyA)
    expect(deserialized.polys[1]).toBeInstanceOf(PolyB)
  })

  describe('serializable classes without decorated properties', () => {
    test('serialize returns an empty object instead of throwing', () => {
      expect(serialize(new Polymorphic())).toStrictEqual({})
    })

    test('deserialize returns an instance instead of throwing', () => {
      expect(deserialize({}, Polymorphic)).toBeInstanceOf(Polymorphic)
    })

    test('deserializing without resolveType yields base class instances', () => {
      @Serializable()
      class Holder {
        @JsonProperty({ elementType: Polymorphic })
        polys: Polymorphic[]
      }

      const deserialized = deserialize({ polys: [{ name: 'PolyA' }] }, Holder)
      expect(deserialized.polys[0]).toBeInstanceOf(Polymorphic)
    })
  })
})
