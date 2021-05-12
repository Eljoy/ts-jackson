import { inRange } from 'lodash'
import {
  RequiredPropertyError,
  SerializableError,
  ValidatePropertyError,
} from './common'
import deserialize from './deserialize'
import JsonProperty from './JsonProperty'
import Serializable from './Serializable'

describe('deserialize', () => {
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

  test('Class with constructor arguments', () => {
    const json = {
      id: 'idValue',
      bar: {
        foo: true,
        baz: 'bazName',
      },
    }

    @Serializable()
    class Class {
      @JsonProperty()
      id: string

      @JsonProperty()
      bar: {
        foo: boolean
        baz: string
      }

      constructor(readonly foo: number, readonly baz: string) {}
    }

    const expected = new Class(4, 'baz')
    expected.id = json.id
    expected.bar = json.bar
    expect(deserialize(json, Class, 4, 'baz')).toStrictEqual(expected)
  })

  test('Class with required field', () => {
    @Serializable()
    class Class {
      @JsonProperty({ required: true })
      id: string
    }

    expect(() => deserialize({}, Class)).toThrow(
      new RequiredPropertyError({
        serializableClass: Class,
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
      dog: {
        name: 'Scooby Doo',
      },
    }
    const dog = new Dog()
    dog.name = json.dog.name

    const expected = new Owner()
    expected.dog = dog
    expected.name = json.name
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

      @JsonProperty({ elementType: Dog })
      dogs: Dog[]
    }

    const json = {
      name: 'Shaggy',
      dogs: [
        {
          name: 'Scooby Doo',
        },
        {
          name: 'Scrappy Doo',
        },
      ],
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
      dogs: [
        {
          name: 'Scooby Doo',
        },
        {
          name: 'Scrappy Doo',
        },
      ],
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

    it('should assume valid', () => {
      expect(() => deserialize({}, Manager)).not.toThrow(
        new SerializableError(Manager)
      )
    })

    it(`should take into account inherited properties marked with @${JsonProperty.name}`, () => {
      const json = {
        id: 'idValue',
        role: 'assistant-manager',
      }
      const expected = new Manager()
      expected.id = json.id
      expected.role = json.role
      expect(deserialize(json, Manager)).toStrictEqual(expected)
    })
  })

  describe('validate', () => {
    const validate = (property) => inRange(property, 18, 99)

    @Serializable()
    class Class {
      @JsonProperty<number>({
        validate,
      })
      age: number
    }

    test('should throw an Error if property failed validate check', () => {
      const invalidData = {
        age: 14,
      }
      expect(() => deserialize(invalidData, Class)).toThrow(
        new ValidatePropertyError({
          propName: 'age',
          propValue: 14,
          validate,
          serializableClass: Class,
        })
      )
    })

    test('should not throw an Error if property pass validate check', () => {
      const validData = {
        age: 18,
      }
      expect(() => deserialize(validData, Class)).not.toThrow(
        ValidatePropertyError
      )
    })
  })

  it(`Should throw an error if class is not annotated with ${Serializable.name}`, () => {
    class Class {}

    expect(() => deserialize({}, Class)).toThrow(new SerializableError(Class))
  })

  test('Custom deserialize param', () => {
    const json = {
      full_name: {
        name: 'John',
        surname: 'Jackson',
      },
    }

    @Serializable()
    class Class {
      @JsonProperty<string>({
        path: 'full_name',
        deserialize: (jsonValue: typeof json.full_name) =>
          jsonValue.name + ' ' + jsonValue.surname,
      })
      fullName: string
    }

    const expected = new Class()
    expected.fullName = json.full_name.name + ' ' + json.full_name.surname
    expect(deserialize(json, Class)).toStrictEqual(expected)
  })

  describe('afterDeserialize', () => {
    test('Date', () => {
      const json = {
        expires_in: 3600,
      }

      @Serializable()
      class Class {
        @JsonProperty<Date>({
          path: 'expires_in',
          afterDeserialize: (_, propertyValue) => {
            return new Date(Date.now() + propertyValue.getTime())
          },
        })
        expiresAt: Date
      }
      const expected = new Class()
      const expiresAt = new Date(Date.now() + json.expires_in)
      expected.expiresAt = expiresAt
      const deserializedValue = deserialize(json, Class)
      expect(deserializedValue.expiresAt.getTime()).toBeGreaterThanOrEqual(
        expiresAt.getTime()
      )
      expect(deserializedValue.expiresAt.getTime()).toBeLessThan(
        expiresAt.getTime() + 100
      )
    })

    test('String', () => {
      @Serializable()
      class Class {
        @JsonProperty()
        name: string

        @JsonProperty<string>({
          path: 'surname',
          afterDeserialize: (deserializedInstance: Class, propertyValue) => {
            return deserializedInstance.name + ' ' + propertyValue
          },
        })
        fullName: string
      }

      const json = {
        name: 'John',
        surname: 'Jones',
      }

      const expected = new Class()
      expected.name = json.name
      expected.fullName = json.name + ' ' + json.surname
      expect(deserialize(json, Class)).toEqual(expected)
    })
  })
})
