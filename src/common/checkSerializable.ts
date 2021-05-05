import { ReflectMetaDataKeys } from './ReflectMetaDataKeys'

export default function checkSerializable(target: Object): boolean {
  if (!target) {
    return false
  }
  const options = Reflect.getMetadata(
    ReflectMetaDataKeys.TsJacksonSerializable,
    target
  )
  return options !== undefined
}
