import { get, set } from 'lodash'
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
      : deserializeProperty(
          jsonValue,
          propParams.type,
          propParams.arrayValueType
        )
    propParams.validate &&
      assertValid({
        propName,
        propValue: deserializedValue,
        validate: propParams.validate,
        serializableClass,
      })
    set(result, propName, deserializedValue)
  }
  return result
}

function deserializeProperty(
  value: unknown,
  toType: JsonPropertyMetadata['type'],
  arrayValueType: JsonPropertyMetadata['arrayValueType']
) {
  switch (toType.name) {
    case Types.Date: {
      return Date.parse(value as string)
    }
    case Types.Array: {
      return (value as Record<string, unknown>[]).map((item) => {
        const isSerializable = checkSerializable(arrayValueType)
        return isSerializable ? deserialize(item, arrayValueType) : item
      })
    }
    case Types.String:
    case Types.Boolean:
    case Types.Number: {
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
