import { ReflectMetaDataKeys } from './ReflectMetaDataKeys'

export default function checkSerializable(target: Object): boolean {
  const options = Reflect.getMetadata(
    ReflectMetaDataKeys.TsJacksonSerializable,
    target
  )
  return options !== undefined
}
