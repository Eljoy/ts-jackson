import 'reflect-metadata'
import { ReflectMetaDataKeys } from './common'

type Params = {}

export type SerializableMetadata = {
  className: string
} & Params

export default function Serializable(): (
  target: new (...params: Array<unknown>) => unknown
) => void {
  return (target) => {
    Reflect.defineMetadata(
      ReflectMetaDataKeys.TsJacksonSerializable,
      { className: target.name },
      target
    )
  }
}
