import 'reflect-metadata'
import { ReflectMetaDataKeys } from './common'
import JsonProperty, { JsonPropertyMetadata } from './JsonProperty'

describe('JsonProperty', () => {
  const testJsonPropertyMetadata = (
    propertyName: string,
    expectedMetadata: any,
    targetClass: any
  ) => {
    const metaData: JsonPropertyMetadata = Reflect.getMetadata(
      ReflectMetaDataKeys.TsJacksonJsonProperty,
      targetClass
    )
    expect(metaData[propertyName]).toMatchObject(expectedMetadata)
  }

  it('should set default path when no args provided', () => {
    class TestClass {
      @JsonProperty()
      foo: string
    }

    testJsonPropertyMetadata(
      'foo',
      { name: 'foo', path: 'foo', type: String },
      TestClass
    )
  })

  it('should set custom path when provided as string', () => {
    class TestClass {
      @JsonProperty('a.b.c')
      foo: number
    }

    testJsonPropertyMetadata(
      'foo',
      { name: 'foo', path: 'a.b.c', type: Number },
      TestClass
    )
  })

  it('should set custom path when provided in options', () => {
    class TestClass {
      @JsonProperty({ path: 'a[0]' })
      foo: number
    }

    testJsonPropertyMetadata(
      'foo',
      { name: 'foo', path: 'a[0]', type: Number },
      TestClass
    )
  })

  it('should handle custom validate function', () => {
    const validate = (foo: number) => foo > 5

    class TestClass {
      @JsonProperty({ validate })
      foo: number
    }

    testJsonPropertyMetadata('foo', { validate }, TestClass)
  })

  it('should override type when provided in options', () => {
    class TestClass {
      @JsonProperty({ type: Array })
      foo: number[]
    }

    testJsonPropertyMetadata(
      'foo',
      { name: 'foo', path: 'foo', type: Array },
      TestClass
    )
  })

  describe('Paths', () => {
    it('should handle multiple paths as an argument', () => {
      class TestClass {
        @JsonProperty(['path1', 'path2'])
        foo: number
      }

      testJsonPropertyMetadata(
        'foo',
        { name: 'foo', paths: ['path1', 'path2'], type: Number },
        TestClass
      )
    })

    it('should handle multiple paths as a property', () => {
      class TestClass {
        @JsonProperty({ paths: ['path1', 'path2'] })
        foo: number
      }

      testJsonPropertyMetadata(
        'foo',
        { name: 'foo', paths: ['path1', 'path2'], type: Number },
        TestClass
      )
    })
  })
})
