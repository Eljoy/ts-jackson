import { Serializable, serialize } from '../index'
import SerializableError from './common/SerializableError'
import JsonProperty from './JsonProperty'

describe('serialize', () => {
  it(`should throw an error if class is not annotated with ${Serializable.name}`, () => {
    class Class {}
    expect(() => serialize(new Class())).toThrow(new SerializableError(Class))
  })

  test('simple paths', () => {
    const json = {
      foo: 'test',
      baz: 5,
      bars: ['hello', 'star'],
    }

    @Serializable()
    class Class {
      @JsonProperty()
      foo: string

      @JsonProperty()
      baz: number

      @JsonProperty()
      bars: Array<string>
    }

    const testClass = new Class()
    testClass.foo = json.foo
    testClass.baz = json.baz
    testClass.bars = json.bars
    expect(serialize(testClass)).toEqual(testClass)
  })

  test('nested paths', () => {
    const json = {
      nested: {
        foo: 'test',
        bars: ['hello', 'star'],
      },
    }

    @Serializable()
    class Class {
      @JsonProperty('nested.foo')
      foo: string

      @JsonProperty('nested.bars[0]')
      bar1: string

      @JsonProperty('nested.bars[1]')
      bar2: string
    }

    const testClass = new Class()
    testClass.foo = json.nested.foo
    testClass.bar1 = json.nested.bars[0]
    testClass.bar2 = json.nested.bars[1]
    expect(serialize(testClass)).toEqual(json)
  })

  test('inheritance', () => {
    @Serializable()
    class Parent {
      @JsonProperty()
      foo = 'fooValue'
    }

    class Child extends Parent {
      @JsonProperty()
      baz = 'bazValue'
    }
    expect(serialize(new Child())).toEqual({
      foo: 'fooValue',
      baz: 'bazValue',
    })
  })

  test('one to one relation', () => {
    const json = {
      name: 'Shaggy',
      dog: {
        name: 'Scooby Doo',
      },
    }
    @Serializable()
    class Dog {
      @JsonProperty()
      name
    }

    @Serializable()
    class Owner {
      @JsonProperty()
      name

      @JsonProperty()
      dog: Dog
    }
    const dog = new Dog()
    dog.name = json.dog.name
    const owner = new Owner()
    owner.name = json.name
    owner.dog = dog
    expect(serialize(owner)).toStrictEqual(json)
  })

  test('one to many relation', () => {
    @Serializable()
    class Dog {
      @JsonProperty()
      name
    }

    @Serializable()
    class Owner {
      @JsonProperty()
      name

      @JsonProperty({ arrayValueType: Dog })
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

    const owner = new Owner()
    owner.name = json.name
    owner.dogs = [scoobyDoo, scrappyDoo]
    expect(serialize(owner)).toStrictEqual(json)
  })

  test('"Set" property type', () => {
    @Serializable()
    class Dog {
      @JsonProperty()
      name
    }

    @Serializable()
    class Owner {
      @JsonProperty()
      name

      @JsonProperty({ arrayValueType: Dog })
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

    const owner = new Owner()
    owner.name = json.name
    owner.dogs = new Set([scoobyDoo, scrappyDoo])
    expect(serialize(owner)).toStrictEqual(json)
  })
})
