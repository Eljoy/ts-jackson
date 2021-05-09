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
 * @param {Record<string, unknown>} json
 * @param serializableClass Class to which json should be serialized
 * @param args an arguments to be provided to constructor.
 * For example Cat(readonly name, readonly color)
 * deserialize({}, Cat, 'Moon', 'black')
 */
export default function deserialize<T, U extends Array<unknown>>(
  json: Record<string, unknown>,
  serializableClass: new (...params: [...U]) => T,
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
  const result = new serializableClass(...args)
  for (const [propName, propParams] of Object.entries(propsMetadata)) {
    const jsonValue = get(json, propParams.path)
    propParams.required &&
      assertRequired({
        json,
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
      set(result, propName, deserializedValue)
    }
  }
  return result
}

function deserializeProperty(
  value: unknown,
  toType: JsonPropertyMetadata['type'],
  elementType: JsonPropertyMetadata['elementType']
) {
  if (value === undefined || value === null) {
    return value
  }
  switch (toType?.name) {
    case Types.Date: {
      return Date.parse(value as string)
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
      return value
    }
    default: {
      const isSerializable = checkSerializable(toType)
      return isSerializable
        ? deserialize(value as Record<string, unknown>, toType)
        : value
    }
  }
}
