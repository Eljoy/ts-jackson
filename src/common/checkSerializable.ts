import getClassMetadata from './getClassMetadata'
import { ReflectMetaDataKeys } from './ReflectMetaDataKeys'

export default function checkSerializable(
  target: (new (...params) => unknown) | Function
): boolean {
  if (!target) {
    return false
  }
  return (
    getClassMetadata(ReflectMetaDataKeys.TsJacksonSerializable, target) !==
    undefined
  )
}
