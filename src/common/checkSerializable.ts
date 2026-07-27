import { ReflectMetaDataKeys } from './ReflectMetaDataKeys'

export default function checkSerializable(
  target: (new (...params) => unknown) | Function
): boolean {
  if (!target) {
    return false
  }
  const options = Reflect.getMetadata(
    ReflectMetaDataKeys.TsJacksonSerializable,
    target
  )
  return options !== undefined
}
