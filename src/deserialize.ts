import { pipe } from 'fp-ts/function'
import get from 'lodash/get'
import set from 'lodash/set'
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
 * Function to deserialize JSON to a Serializable class instance using the pipe pattern.
 */
export default function deserialize<T, U extends unknown[]>(
  json: Record<string, unknown> | string,
  serializableClass: new (...args: U) => T,
  ...args: U
): T {
  assertSerializable(serializableClass)
  type PropertyName = string

  const propsMetadata: Array<[PropertyName, JsonPropertyMetadata]> =
    Object.entries(
      Reflect.getMetadata(
        ReflectMetaDataKeys.TsJacksonJsonProperty,
        serializableClass
      )
    )
  const classInstance = new serializableClass(...args)
  const jsonObject = typeof json === 'string' ? JSON.parse(json) : json

  type Context<S = unknown> = S & {
    propName: string
    metadata: JsonPropertyMetadata
    classInstance: T
  }

  function extractValue<T>({ propName, metadata }: Context<T>) {
    return {
      propName,
      metadata,
      jsonValue: metadata.paths
        ? metadata.paths.map((path) => get(jsonObject, path))
        : get(jsonObject, metadata.path),
    }
  }

  function checkRequired<T>({ propName, metadata, ...rest }: Context & T) {
    if (metadata.required) {
      assertRequired({
        json: jsonObject,
        propName,
        propValue: undefined,
        serializableClass,
        propPath: metadata.path,
      })
    }
    return { propName, metadata, ...rest }
  }

  function deserializeProperty<T>({
    propName,
    metadata,
    jsonValue,
  }: Context & T & { jsonValue: string }) {
    const deserializedValue =
      metadata.deserialize?.(jsonValue) ??
      deserializeValue(jsonValue, metadata.type, metadata.elementType)

    return { propName, metadata, deserializedValue }
  }

  function validateProperty<T>({
    propName,
    metadata,
    deserializedValue,
  }: Context & { deserializedValue: unknown } & T) {
    if (metadata.validate) {
      assertValid({
        propName,
        propValue: deserializedValue,
        validate: metadata.validate,
        serializableClass,
      })
    }
    return { propName, metadata, deserializedValue }
  }

  function afterDeserialize<T>({
    propName,
    metadata,
    deserializedValue,
    ...rest
  }: Context & { deserializedValue: unknown } & T) {
    return {
      ...rest,
      propName,
      metadata,
      deserializedValue:
        metadata.afterDeserialize?.(classInstance, deserializedValue) ??
        deserializedValue,
    }
  }

  const result: Array<[string, unknown]> = propsMetadata.map(
    ([propName, metadata]) => {
      const propValue = pipe(
        { propName, metadata, classInstance },
        extractValue,
        checkRequired,
        deserializeProperty,
        afterDeserialize,
        validateProperty
      )
      return [propName, propValue.deserializedValue]
    }
  )

  console.log('result ', result)

  result.forEach(([propName, propValue]) => {
    if (propValue !== undefined) {
      set(classInstance as Object, propName, propValue)
    }
  })

  return classInstance
}

function getPropertiesMetadata<T>(
  serializableClass: new (...args: any[]) => T
) {
  return (context: DeserializationContext<T>): DeserializationContext<T> => {
    const propsMetadata: Record<string, JsonPropertyMetadata> =
      Reflect.getMetadata(
        ReflectMetaDataKeys.TsJacksonJsonProperty,
        serializableClass
      )
    return { ...context, propsMetadata }
  }
}

/**
 * Parses the input JSON string into an object if necessary.
 */
function parseJson(
  json: Record<string, unknown> | string
): Record<string, unknown> {
  return typeof json === 'string' ? JSON.parse(json) : json
}

/**
 * Initializes an instance of the serializable class.
 */
function initializeInstance<T, U extends unknown[]>(
  serializableClass: new (...args: U) => T,
  ...args: U
) {
  return (jsonObject: Record<string, unknown>): DeserializationContext<T> => {
    const instance = new serializableClass(...args)
    return { instance, jsonObject }
  }
}

export function deserialize2<T, U extends Array<unknown>>(
  json: Record<string, unknown> | string,
  serializableClass: new (...args: [...U]) => T,
  ...args: U
): T {
  assertSerializable(serializableClass)
  const propsMetadata: Record<string, JsonPropertyMetadata> =
    Reflect.getMetadata(
      ReflectMetaDataKeys.TsJacksonJsonProperty,
      serializableClass
    )
  const resultClass = new serializableClass(...args)
  const jsonObject = typeof json === 'string' ? JSON.parse(json) : json
  const propertiesAfterDeserialize: {
    propName: string
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
      : deserializeValue(jsonValue, propParams.type, propParams.elementType)
    propParams.validate &&
      assertValid({
        propName,
        propValue: deserializedValue,
        validate: propParams.validate,
        serializableClass,
      })
    if (deserializedValue !== undefined) {
      set(resultClass as Object, propName, deserializedValue)
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
        resultClass as Object,
        propName,
        afterDeserialize(resultClass, deserializedValue)
      )
    }
  )
  return resultClass
}

/**
 * Processes each property: extraction, deserialization, validation, setting on instance.
 */
function processProperties<T>(
  context: DeserializationContext<T>
): DeserializationContext<T> {
  const { instance, jsonObject, propsMetadata } = context
  const propertiesAfterDeserialize: Array<AfterDeserializeInfo> = []

  Object.entries(propsMetadata).forEach(([propName, propParams]) => {
    const jsonValue = extractJsonValue(jsonObject, propParams)

    if (propParams.required) {
      assertRequired({
        json: jsonObject,
        propName,
        propValue: jsonValue,
        serializableClass: instance.constructor as any,
        propPath: propParams.path,
      })
    }

    const deserializedValue = propParams.deserialize
      ? propParams.deserialize(jsonValue)
      : deserializeValue(jsonValue, propParams.type, propParams.elementType)

    if (propParams.validate) {
      assertValid({
        propName,
        propValue: deserializedValue,
        validate: propParams.validate,
        serializableClass: instance.constructor as any,
      })
    }

    if (deserializedValue !== undefined) {
      set(instance as Object, propName, deserializedValue)
    }

    if (propParams.afterDeserialize) {
      propertiesAfterDeserialize.push({
        propName,
        deserializedValue,
        afterDeserialize: propParams.afterDeserialize,
      })
    }
  })

  return { ...context, propertiesAfterDeserialize }
}

/**
 * Applies any afterDeserialize functions to the properties.
 */
function applyAfterDeserialize<T>(context: DeserializationContext<T>): T {
  const { instance, propertiesAfterDeserialize } = context

  propertiesAfterDeserialize.forEach(
    ({ propName, deserializedValue, afterDeserialize }) => {
      set(
        instance as Object,
        propName,
        afterDeserialize(instance, deserializedValue)
      )
    }
  )

  return instance
}

/**
 * Extracts the JSON value based on the property metadata.
 */
function extractJsonValue(
  jsonObject: Record<string, unknown>,
  propParams: JsonPropertyMetadata
): unknown {
  if (propParams.paths) {
    return propParams.paths.map((path) => get(jsonObject, path))
  }
  return get(jsonObject, propParams.path)
}

/**
 * Deserializes a property value based on its type and element type.
 */
function deserializeValue(
  value: unknown,
  toType: JsonPropertyMetadata['type'],
  elementType?: JsonPropertyMetadata['elementType']
): unknown {
  if (value === undefined || value === null || toType === undefined) {
    return value
  }

  if (Array.isArray(toType)) {
    return toType.map((itemType, index) =>
      deserializeValue(value[index], itemType)
    )
  }

  if (typeof toType === 'function') {
    const typeName = toType.name
    switch (typeName) {
      case Types.Date:
        return new Date(value as string | number | Date)

      case Types.Array:
        return deserializeArray(value, elementType)

      case Types.Set:
        return deserializeSet(value, elementType)

      case Types.Boolean:
        return Boolean(value)

      case Types.Number:
        return Number(value)

      case Types.String:
        return String(value)

      default:
        return deserializeCustomType(value, toType)
    }
  }

  return value
}

/**
 * Deserializes an array of items.
 */
function deserializeArray(
  value: unknown,
  elementType?: JsonPropertyMetadata['elementType']
): unknown[] {
  if (!Array.isArray(value)) {
    throw new TypeError(`Expected array but got ${typeof value}`)
  }

  return value.map((item) => {
    const isSerializable = checkSerializable(elementType)
    return isSerializable && elementType
      ? deserialize(item as Record<string, unknown>, elementType)
      : item
  })
}

/**
 * Deserializes a Set of items.
 */
function deserializeSet(
  value: unknown,
  elementType?: JsonPropertyMetadata['elementType']
): Set<unknown> {
  const array = deserializeArray(value, elementType)
  return new Set(array)
}

/**
 * Deserializes a custom type.
 */
function deserializeCustomType(value: unknown, toType: Function): unknown {
  const isSerializable = checkSerializable(toType)
  if (isSerializable) {
    return deserialize(
      value as Record<string, unknown>,
      toType as new () => unknown
    )
  }
  return value
}

/**
 * Interfaces for deserialization context and afterDeserialize info.
 */
interface DeserializationContext<T> {
  instance: T
  jsonObject: Record<string, unknown>
  propsMetadata?: Record<string, JsonPropertyMetadata>
  propertiesAfterDeserialize?: Array<AfterDeserializeInfo>
}

interface AfterDeserializeInfo {
  propName: string
  deserializedValue: unknown
  afterDeserialize: JsonPropertyMetadata['afterDeserialize']
}
