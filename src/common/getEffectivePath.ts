import type { JsonPropertyMetadata } from '../JsonProperty'
import type { SerializableMetadata } from '../Serializable'
import getClassMetadata from './getClassMetadata'
import { ReflectMetaDataKeys } from './ReflectMetaDataKeys'

export default function getEffectivePath(
  propParams: JsonPropertyMetadata,
  serializableClass: any
): string {
  if (propParams.explicitPath) {
    return propParams.path
  }
  const classMetadata = getClassMetadata<SerializableMetadata>(
    ReflectMetaDataKeys.TsJacksonSerializable,
    serializableClass
  )
  return classMetadata?.formatPropertyName?.(propParams.name) ?? propParams.path
}
