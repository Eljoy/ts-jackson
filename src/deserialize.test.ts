import { RequiredPropertyError, ValidatePropertyError } from './common'
import deserialize from './deserialize'
import JsonProperty from './JsonProperty'
import Serializable from './Serializable'

function inRange(value: number, start: number, end: number) {
  return value >= start && value <= end
}

describe('deserialize', () => {
  describe('Basic deserialization', () => {
    test('Class with object field', () => {
      const json = {
        bar: {
          foo: true,
          baz: 'bazName',
        },
      }

      @Serializable()
      class Class {
        @JsonProperty()
        bar: {
          foo: boolean
          baz: string
        }
      }

      const expected = new Class()
      expected.bar = json.bar
      expect(deserialize(json, Class)).toStrictEqual(expected)
    })

    test('Class with default properties', () => {
      @Serializable()
      class Class {
        @JsonProperty()
        baz = 'test'
      }

      expect(deserialize({}, Class)).toStrictEqual(new Class())
    })

    test('Field without JsonProperty decorator', () => {
      @Serializable()
      class Class {
        @JsonProperty()
        baz = 'bazValue'

        foo = 'fooValue'
      }

      expect(deserialize({}, Class)).toStrictEqual(new Class())
    })

    test('Class with array properties', () => {
      const json = {
        primitiveArray: [1, 2, 3],
        complexArray: [{ foo: 4 }, { baz: true, bar: 'varValue' }],
      }

      @Serializable()
      class Class {
        @JsonProperty()
        primitiveArray: Array<number>
        @JsonProperty()
        complexArray: Array<Record<string, unknown>>
      }

      const expected = new Class()
      expected.primitiveArray = json.primitiveArray
      expected.complexArray = json.complexArray
      expect(deserialize(json, Class)).toEqual(expected)
    })

    test('String json deserialization', () => {
      const json = {
        bar: {
          foo: true,
          baz: 'bazName',
        },
      }

      @Serializable()
      class Class {
        @JsonProperty()
        bar: {
          foo: boolean
          baz: string
        }
      }

      const expected = new Class()
      expected.bar = json.bar
      expect(deserialize(JSON.stringify(json), Class)).toStrictEqual(expected)
    })
  })

  describe('Advanced deserialization scenarios', () => {
    test('Class with constructor arguments', () => {
      const json = {
        id: 'idValue',
        bar: { foo: true, baz: 'bazName' },
      }

      @Serializable()
      class TestClass {
        @JsonProperty()
        id: string
        @JsonProperty()
        bar: { foo: boolean; baz: string }

        constructor(readonly foo: number, readonly baz: string) {}
      }

      const expected = new TestClass(4, 'baz')
      expected.id = json.id
      expected.bar = json.bar
      expect(deserialize(json, TestClass, 4, 'baz')).toStrictEqual(expected)
    })

    test('Class with required field', () => {
      @Serializable()
      class TestClass {
        @JsonProperty({ required: true })
        id: string
      }

      expect(() => deserialize({}, TestClass)).toThrow(
        new RequiredPropertyError({
          serializableClass: TestClass,
          json: {},
          propName: 'id',
          propPath: 'id',
        })
      )
    })

    test('Class with one to one relation', () => {
      @Serializable()
      class Dog {
        @JsonProperty()
        name: string
      }

      @Serializable()
      class Owner {
        @JsonProperty()
        name: string
        @JsonProperty()
        dog: Dog
      }

      const json = {
        name: 'Shaggy',
        dog: { name: 'Scooby Doo' },
      }
      const dog = new Dog()
      dog.name = json.dog.name

      const expected = new Owner()
      expected.name = json.name
      expected.dog = dog
      expect(deserialize(json, Owner)).toStrictEqual(expected)
    })

    test('Class with one to many relation', () => {
      @Serializable()
      class Dog {
        @JsonProperty()
        name: string
      }

      @Serializable()
      class Owner {
        @JsonProperty()
        name: string
        @JsonProperty<Dog>({ elementType: Dog })
        dogs: Dog[]
      }

      const json = {
        name: 'Shaggy',
        dogs: [{ name: 'Scooby Doo' }, { name: 'Scrappy Doo' }],
      }
      const scoobyDoo = new Dog()
      scoobyDoo.name = json.dogs[0].name

      const scrappyDoo = new Dog()
      scrappyDoo.name = json.dogs[1].name

      const expected = new Owner()
      expected.dogs = [scoobyDoo, scrappyDoo]
      expected.name = json.name
      expect(deserialize(json, Owner)).toStrictEqual(expected)
    })

    test('"Set" property type', () => {
      @Serializable()
      class Dog {
        @JsonProperty()
        name: string
      }

      @Serializable()
      class Owner {
        @JsonProperty()
        name: string
        @JsonProperty({ elementType: Dog })
        dogs: Set<Dog>
      }

      const json = {
        name: 'Shaggy',
        dogs: [{ name: 'Scooby Doo' }, { name: 'Scrappy Doo' }],
      }
      const scoobyDoo = new Dog()
      scoobyDoo.name = json.dogs[0].name

      const scrappyDoo = new Dog()
      scrappyDoo.name = json.dogs[1].name

      const expected = new Owner()
      expected.dogs = new Set([scoobyDoo, scrappyDoo])
      expected.name = json.name
      expect(deserialize(json, Owner)).toStrictEqual(expected)
    })

    // ... [Continuation from previous parts]

    test('Tuple type', () => {
      @Serializable()
      class Foo {
        @JsonProperty()
        value: string
      }

      @Serializable()
      class Bar {
        @JsonProperty<[Number, Array<string>, Foo]>({
          type: [Number, Array, Foo],
        })
        params: [Number, Array<string>, Foo]
      }

      const json = { params: [5, ['test'], { value: 'FooValue' }] }
      const deserialized = deserialize(json, Bar)

      const expected = new Bar()
      expected.params = [
        json.params[0] as number,
        json.params[1] as string[],
        new Foo(),
      ]
      expected.params[2].value = 'FooValue'

      expect(deserialized).toStrictEqual(expected)
      expect(deserialized.params[2]).toBeInstanceOf(Foo)
    })

    describe('Inheritance', () => {
      @Serializable()
      class Profile {
        @JsonProperty()
        id: string
      }

      class Manager extends Profile {
        @JsonProperty()
        role: string
      }

      it('should deserialize inherited properties', () => {
        const json = { id: 'idValue', role: 'assistant-manager' }
        const expected = new Manager()
        expected.id = json.id
        expected.role = json.role
        expect(deserialize(json, Manager)).toStrictEqual(expected)
      })
    })

    describe('validate', () => {
      const validate = (property: number) => inRange(property, 18, 99)

      @Serializable()
      class Class {
        @JsonProperty<number>({ validate })
        age: number
      }

      test('should throw an error if property fails validation', () => {
        const invalidData = { age: 14 }
        expect(() => deserialize(invalidData, Class)).toThrow(
          ValidatePropertyError
        )
      })

      test('should not throw an error if property passes validation', () => {
        const validData = { age: 18 }
        expect(() => deserialize(validData, Class)).not.toThrow()
      })
    })

    test('Custom deserialize param', () => {
      @Serializable()
      class Class {
        @JsonProperty<string>({
          path: 'full_name',
          deserialize: (jsonValue: { name: string; surname: string }) =>
            jsonValue.name + ' ' + jsonValue.surname,
        })
        fullName: string
      }

      const json = { full_name: { name: 'John', surname: 'Doe' } }
      const expected = new Class()
      expected.fullName = 'John Doe'
      expect(deserialize(json, Class)).toStrictEqual(expected)
    })

    describe('afterDeserialize', () => {
      test('modifies property after deserialization', () => {
        @Serializable()
        class Class {
          @JsonProperty<Date>({
            path: 'expires_in',
            afterDeserialize: (_, propertyValue: number) =>
              new Date(Date.now() + propertyValue * 1000),
          })
          expiresAt: Date
        }

        const json = { expires_in: 3600 }
        const deserialized = deserialize(json, Class)
        expect(deserialized.expiresAt).toBeInstanceOf(Date)
        expect(deserialized.expiresAt.getTime()).toBeGreaterThan(Date.now())
      })
    })

    test('Class with floating number property', () => {
      const json = {
        temperature: 36.6,
      }

      @Serializable()
      class Person {
        @JsonProperty()
        temperature: number
      }

      const expected = new Person()
      expected.temperature = json.temperature
      expect(deserialize(json, Person)).toStrictEqual(expected)
    })
  })
})
