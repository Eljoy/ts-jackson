/**
 * @author Ilias Gazdaliev <invimind@gmail.com>
 */
import { set } from 'lodash'
import {
  assertSerializable,
  checkSerializable,
  ReflectMetaDataKeys,
  Types,
} from './common'
import { JsonPropertyMetadata } from './JsonProperty'

/**
 * Function to serialize Serializable class to json
 *
 * @param {Function} instance serializable instance
 * @returns {Record<string, unknown>} json
 */
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
    const serializedProperty = propParams.serialize
      ? propParams.serialize(instance[propName])
      : serializeProperty(
          instance[propName],
          propParams.type,
          propParams.elementType
        )
    set(json, propParams.path, serializedProperty)
  }
  return json
}

function serializeProperty(
  value: unknown,
  type: JsonPropertyMetadata['type'],
  elementType: JsonPropertyMetadata['elementType']
) {
  if (value === undefined) {
    return value
  }
  switch (type?.name) {
    case Types.Array: {
      return (value as Record<string, unknown>[]).map((item) => {
        const isSerializable = checkSerializable(elementType)
        return isSerializable ? serialize(item) : item
      })
    }
    case Types.Set: {
      return Array.from((value as Set<Record<string, unknown>>).values()).map(
        (item) => {
          const isSerializable = checkSerializable(elementType)
          return isSerializable ? serialize(item) : item
        }
      )
    }
    default: {
      const isSerializable = checkSerializable(type)
      return isSerializable
        ? serialize(value as Record<string, unknown>)
        : value
    }
  }
}
