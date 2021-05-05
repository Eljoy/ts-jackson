import 'reflect-metadata'
import { ReflectMetaDataKeys } from './common'
import JsonProperty, { JsonPropertyMetadata } from './JsonProperty'

describe('JsonProperty', () => {
  test('JsonProperty property path with no args provided', () => {
    class Class {
      @JsonProperty()
      foo: string
    }
    const metaData: JsonPropertyMetadata = Reflect.getMetadata(
      ReflectMetaDataKeys.TsJacksonJsonProperty,
      Class
    )
    expect(metaData).toMatchObject({
      foo: {
        name: 'foo',
        path: 'foo',
        type: String,
      },
    })
  })

  test('JsonProperty property with path provided as string', () => {
    class Class {
      @JsonProperty('a.b.c')
      foo: number
    }
    const metaData: JsonPropertyMetadata = Reflect.getMetadata(
      ReflectMetaDataKeys.TsJacksonJsonProperty,
      Class
    )
    expect(metaData).toMatchObject({
      foo: {
        name: 'foo',
        path: 'a.b.c',
        type: Number,
      },
    })
  })

  test('JsonProperty property with path provided as a part of options argument', () => {
    class Class {
      @JsonProperty({ path: 'a[0]' })
      foo: number
    }
    const metaData: JsonPropertyMetadata = Reflect.getMetadata(
      ReflectMetaDataKeys.TsJacksonJsonProperty,
      Class
    )
    expect(metaData).toMatchObject({
      foo: {
        name: 'foo',
        path: 'a[0]',
        type: Number,
      },
    })
  })
})
