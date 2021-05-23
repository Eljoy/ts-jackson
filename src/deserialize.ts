/**
 * @author Ilias Gazdaliev <invimind@gmail.com>
 */
import get from 'lodash.get'
import set from 'lodash.set'
import 'reflect-metadata'
import {
  assertRequired,
  assertSerializable,
  assertValid,
  checkSerializable,
  ReflectMetaDataKeys,
  Types,
} from './common'
import { JsonPropertyMetadata } from './JsonProperty'

/**
 * Function to deserialize json to Serializable class
 *
 * @param {Record<string, unknown> | string} json
 * @param serializableClass Class to which json should be serialized
 * @param args an arguments to be provided to constructor.
 * For example Cat(readonly name, readonly color)
 * deserialize({}, Cat, 'Moon', 'black')
 */
export default function deserialize<T, U extends Array<unknown>>(
  json: Record<string, unknown> | string,
  serializableClass: new (...args: [...U]) => T,
  ...args: U
): T {
  assertSerializable(serializableClass)
  const propsMetadata: Record<
    string,
    JsonPropertyMetadata
  > = Reflect.getMetadata(
    ReflectMetaDataKeys.TsJacksonJsonProperty,
    serializableClass
  )
  const resultClass = new serializableClass(...args)
  const jsonObject = typeof json === 'string' ? JSON.parse(json) : json
  const propertiesAfterDeserialize: {
    propName: unknown
    deserializedValue: unknown
    afterDeserialize: JsonPropertyMetadata['afterDeserialize']
  }[] = []
  for (const [propName, propParams] of Object.entries(propsMetadata)) {
    const jsonValue = propParams.paths
      ? propParams.paths.map((path) => get(jsonObject, path))
      : get(jsonObject, propParams.path)
    propParams.required &&
      assertRequired({
        json: jsonObject,
        propName,
        propValue: jsonValue,
        serializableClass,
        propPath: propParams.path,
      })
    const deserializedValue = propParams.deserialize
      ? propParams.deserialize(jsonValue)
      : deserializeProperty(jsonValue, propParams.type, propParams.elementType)
    propParams.validate &&
      assertValid({
        propName,
        propValue: deserializedValue,
        validate: propParams.validate,
        serializableClass,
      })
    if (deserializedValue !== undefined) {
      set(resultClass, propName, deserializedValue)
    }
    propParams.afterDeserialize &&
      propertiesAfterDeserialize.push({
        propName,
        deserializedValue,
        afterDeserialize: propParams.afterDeserialize,
      })
  }
  propertiesAfterDeserialize.forEach(
    ({ propName, deserializedValue, afterDeserialize }) => {
      set(
        resultClass,
        propName,
        afterDeserialize(resultClass, deserializedValue)
      )
    }
  )
  return resultClass
}

function deserializeProperty(
  value: unknown,
  toType: JsonPropertyMetadata['type'],
  elementType?: JsonPropertyMetadata['elementType']
) {
  if (value === undefined || value === null || toType === undefined) {
    return value
  }
  if (Array.isArray(toType)) {
    return toType.map((toTypeItem, index) => {
      return deserializeProperty(value[index], toTypeItem)
    })
  }
  if (typeof toType === 'function') {
    switch (toType?.name) {
      case Types.Date: {
        return new Date(value as string | number | Date)
      }
      case Types.Array: {
        return (value as Record<string, unknown>[]).map((item) => {
          const isSerializable = checkSerializable(elementType)
          return isSerializable ? deserialize(item, elementType) : item
        })
      }
      case Types.Set: {
        const values = (value as Record<string, unknown>[]).map((item) => {
          const isSerializable = checkSerializable(elementType)
          return isSerializable ? deserialize(item, elementType) : item
        })
        return new Set(values)
      }
      case Types.Boolean: {
        return Boolean(value)
      }
      case Types.Number: {
        return Number.parseInt(value as string)
      }
      case Types.String: {
        return value.toString()
      }
      default: {
        const isSerializable = checkSerializable(toType)
        return isSerializable
          ? deserialize(value as Record<string, unknown>, toType)
          : value
      }
    }
  }
}
