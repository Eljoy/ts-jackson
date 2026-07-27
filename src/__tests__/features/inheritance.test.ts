import deserialize from '../../deserialize'
import JsonProperty from '../../JsonProperty'
import Serializable from '../../Serializable'
import serialize from '../../serialize'

describe('Inheritance', () => {
  describe('Metadata isolation', () => {
    @Serializable()
    class Profile {
      @JsonProperty()
      id: string
    }

    @Serializable()
    class Manager extends Profile {
      @JsonProperty()
      role: string
    }

    @Serializable()
    class Customer extends Profile {
      @JsonProperty()
      loyaltyPoints: number
    }

    test('sibling subclasses do not leak metadata into each other', () => {
      const customer = new Customer()
      customer.id = 'customerId'
      customer.loyaltyPoints = 5

      expect(serialize(customer)).toStrictEqual({
        id: 'customerId',
        loyaltyPoints: 5,
      })

      const manager = new Manager()
      manager.id = 'managerId'
      manager.role = 'assistant'

      expect(serialize(manager)).toStrictEqual({
        id: 'managerId',
        role: 'assistant',
      })
    })

    test('subclass properties do not pollute the parent class', () => {
      const profile = new Profile()
      profile.id = 'profileId'

      expect(serialize(profile)).toStrictEqual({ id: 'profileId' })

      const deserialized = deserialize(
        { id: 'profileId', role: 'ghost', loyaltyPoints: 42 },
        Profile
      )
      expect(deserialized).toStrictEqual(profile)
    })

    test('deserializing a subclass includes inherited properties', () => {
      const json = { id: 'idValue', role: 'assistant-manager' }
      const expected = new Manager()
      expected.id = json.id
      expected.role = json.role

      expect(deserialize(json, Manager)).toStrictEqual(expected)
    })
  })

  describe('Overriding inherited properties', () => {
    @Serializable()
    class Base {
      @JsonProperty('base_name')
      name: string
    }

    @Serializable()
    class Child extends Base {
      @JsonProperty('child_name')
      name: string
    }

    test('subclass can override the path of an inherited property', () => {
      const child = deserialize({ child_name: 'childValue' }, Child)
      expect(child.name).toBe('childValue')
      expect(serialize(child)).toStrictEqual({ child_name: 'childValue' })
    })

    test('parent keeps its original property configuration', () => {
      const base = deserialize({ base_name: 'baseValue' }, Base)
      expect(base.name).toBe('baseValue')
      expect(serialize(base)).toStrictEqual({ base_name: 'baseValue' })
    })
  })

  describe('Multi-level inheritance', () => {
    @Serializable()
    class A {
      @JsonProperty()
      a: string
    }

    @Serializable()
    class B extends A {
      @JsonProperty()
      b: string
    }

    @Serializable()
    class C extends B {
      @JsonProperty()
      c: string
    }

    test('grandchild accumulates metadata from the whole chain', () => {
      const json = { a: 'aValue', b: 'bValue', c: 'cValue' }
      const expected = new C()
      expected.a = json.a
      expected.b = json.b
      expected.c = json.c

      const deserialized = deserialize(json, C)
      expect(deserialized).toStrictEqual(expected)
      expect(serialize(deserialized)).toStrictEqual(json)
    })

    test('intermediate class is not polluted by its subclass', () => {
      const json = { a: 'aValue', b: 'bValue', c: 'cValue' }
      const expected = new B()
      expected.a = json.a
      expected.b = json.b

      expect(deserialize(json, B)).toStrictEqual(expected)
    })
  })
})
