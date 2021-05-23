/**
 * @author Ilias Gazdaliev <invimind@gmail.com>
 */
import set from 'lodash.set'
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
export default function serialize<T extends new (...args) => unknown>(
  instance: InstanceType<T>
): Record<string, unknown> {
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
    let propertyValue, type
    if (propParams.beforeSerialize) {
      propertyValue = propParams.beforeSerialize(instance[propName])
      type = propertyValue.constructor
    } else {
      propertyValue = instance[propName]
      type = propParams.type
    }
    const serializedProperty = propParams.serialize
      ? propParams.serialize(propertyValue)
      : serializeProperty(propertyValue, type)
    if (propParams.paths) {
      propParams.paths.forEach((path, i) => {
        set(json, path, serializedProperty[i])
      })
    } else {
      set(json, propParams.path, serializedProperty)
    }
  }
  return json
}

function serializeProperty(value: unknown, type: JsonPropertyMetadata['type']) {
  if (value === undefined) {
    return value
  }
  if (Array.isArray(type)) {
    return type.map((toTypeItem, index) => {
      return serializeProperty(value[index], toTypeItem)
    })
  }
  if (typeof type === 'function') {
    switch (type?.name) {
      case Types.Set:
      case Types.Array: {
        return Array.from(
          (value as Set<unknown> | Array<unknown>).values()
        ).map((item) => {
          const isSerializable = checkSerializable(item.constructor)
          return isSerializable ? serialize(item) : item
        })
      }
      default: {
        const isSerializable = checkSerializable(type)
        return isSerializable
          ? serialize(value as Record<string, unknown>)
          : value
      }
    }
  }
}
