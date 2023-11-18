import { Serializable, serialize } from '../index'
import { SerializableError } from './common'
import JsonProperty from './JsonProperty'

describe('serialize', () => {
  it('should throw an error if class is not annotated with Serializable', () => {
    class NonSerializableClass {}
    expect(() => serialize(new NonSerializableClass())).toThrow(
      new SerializableError(NonSerializableClass)
    )
  })

  describe('simple and nested path serialization', () => {
    it('handles simple paths', () => {
      const json = { foo: 'test', baz: 5, bars: ['hello', 'star'] }

      @Serializable()
      class SimpleClass {
        @JsonProperty() foo: string
        @JsonProperty() baz: number
        @JsonProperty() bars: Array<string>
      }

      const instance = Object.assign(new SimpleClass(), json)
      expect(serialize(instance)).toEqual(json)
    })

    it('handles nested paths', () => {
      const json = { nested: { foo: 'test', bars: ['hello', 'star'] } }

      @Serializable()
      class NestedClass {
        @JsonProperty('nested.foo') foo: string
        @JsonProperty('nested.bars[0]') bar1: string
        @JsonProperty('nested.bars[1]') bar2: string
      }

      const instance = new NestedClass()

      instance.bar1 = json.nested.bars[0]
      instance.bar2 = json.nested.bars[1]
      instance.foo = json.nested.foo

      expect(serialize(instance)).toEqual(json)
    })
  })

  describe('handling special types and relations', () => {
    it('handles "Set" property type', () => {
      @Serializable()
      class Dog {
        @JsonProperty() name: string
      }

      @Serializable()
      class Owner {
        @JsonProperty() name: string
        @JsonProperty({ elementType: Dog }) dogs: Set<Dog>
      }

      const json = {
        name: 'Shaggy',
        dogs: [{ name: 'Scooby Doo' }, { name: 'Scrappy Doo' }],
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

    it('ignores fields without JsonProperty decorator', () => {
      @Serializable()
      class ClassWithoutDecorator {
        @JsonProperty() baz: string = 'bazValue'
        foo: string = 'fooValue'
      }

      expect(serialize(new ClassWithoutDecorator())).toStrictEqual({
        baz: 'bazValue',
      })
    })

    it('handles tuple types', () => {
      @Serializable()
      class Foo {
        @JsonProperty() value: string
      }

      @Serializable()
      class Bar {
        @JsonProperty({ type: [Number, Array, Foo] })
        params: [number, string[], Foo]
      }

      const json = {
        params: [5, ['test'], { value: 'FooValue' }],
      }

      const fooInstance = new Foo()
      fooInstance.value = 'FooValue'

      const barInstance = new Bar()
      barInstance.params = [
        json.params[0] as any,
        json.params[1] as any,
        fooInstance,
      ]

      expect(serialize(barInstance)).toStrictEqual(json)
    })

    it('uses custom serialize parameters', () => {
      @Serializable()
      class ClassWithCustomSerialization {
        @JsonProperty({
          serialize: (fullName: string) => {
            const [name, surname] = fullName.split(' ')
            return { name, surname }
          },
        })
        fullName: string = 'Jack Johns'
      }

      expect(serialize(new ClassWithCustomSerialization())).toEqual({
        fullName: { name: 'Jack', surname: 'Johns' },
      })
    })

    it('supports inheritance', () => {
      @Serializable()
      class Parent {
        @JsonProperty() foo: string = 'fooValue'
      }

      @Serializable()
      class Child extends Parent {
        @JsonProperty() baz: string = 'bazValue'
      }

      expect(serialize(new Child())).toEqual({
        foo: 'fooValue',
        baz: 'bazValue',
      })
    })

    it('handles one-to-one relationships', () => {
      const json = { name: 'Shaggy', dog: { name: 'Scooby Doo' } }

      @Serializable()
      class Dog {
        @JsonProperty() name: string
      }

      @Serializable()
      class Owner {
        @JsonProperty() name: string
        @JsonProperty() dog: Dog
      }

      const dog = new Dog()
      dog.name = json.dog.name

      const owner = new Owner()
      owner.name = json.name
      owner.dog = dog

      expect(serialize(owner)).toStrictEqual(json)
    })

    it('handles one-to-many relationships', () => {
      @Serializable()
      class Dog {
        @JsonProperty() name: string
      }

      @Serializable()
      class Owner {
        @JsonProperty() name: string
        @JsonProperty({ elementType: Dog }) dogs: Dog[]
      }

      const json = {
        name: 'Shaggy',
        dogs: [{ name: 'Scooby Doo' }, { name: 'Scrappy Doo' }],
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
  })
})
