import 'reflect-metadata'
import { ReflectMetaDataKeys } from './common'
import Serializable, { SerializableMetadata } from './Serializable'

describe('Serializable', () => {
  test('Serializable metadata', () => {
    @Serializable()
    class Class {}
    const metadata: SerializableMetadata = Reflect.getMetadata(
      ReflectMetaDataKeys.TsJacksonSerializable,
      Class
    )
    expect(metadata).toEqual({
      className: Class.name,
    })
  })
})
