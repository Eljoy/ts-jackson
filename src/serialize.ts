import { set } from 'lodash'
import { assertSerializable, ReflectMetaDataKeys } from './common'
import { JsonPropertyMetadata } from './JsonProperty'

export default function serialize<
  T extends new (...args: unknown[]) => unknown
>(instance: InstanceType<T>): Record<string, unknown> {
  assertSerializable(instance.constructor)
  const propsMetadata: Record<
    string,
    JsonPropertyMetadata
  > = Reflect.getMetadata(
    ReflectMetaDataKeys.TsJacksonJsonProperty,
    instance.constructor
  )
  const json = {}
  for (const [propName, propParams] of Object.entries(propsMetadata)) {
    set(json, propParams.path, instance[propName])
  }
  return json
}
