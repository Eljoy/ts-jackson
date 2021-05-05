import 'reflect-metadata'
import { ReflectMetaDataKeys } from './common'

type SerializableOptions = {}

export default function Serializable(): (target: Object) => void {
  return (target) => {
    Reflect.defineMetadata(
      ReflectMetaDataKeys.TsJacksonSerializable,
      { className: target.constructor.name },
      target
    )
  }
}
