/**
 * @author Ilias Gazdaliev <invimind@gmail.com>
 */
import get from 'lodash/get'
import set from 'lodash/set'
import 'reflect-metadata'
import {
  assertRequired,
  assertSerializable,
  assertValid,
  checkSerializable,
  Pipe,
  PipeStep,
  ReflectMetaDataKeys,
  Types,
} from './common'
import { JsonPropertyMetadata } from './JsonProperty'

type PropertyContext = {
  jsonObject: Record<string, unknown>
  propName: string
  propParams: JsonPropertyMetadata
  serializableClass: new (...args: any[]) => unknown
  instance: object
  value: unknown
}

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
  const propsMetadata: Record<string, JsonPropertyMetadata> =
    Reflect.getMetadata(
      ReflectMetaDataKeys.TsJacksonJsonProperty,
      serializableClass
    )
  const resultClass = new serializableClass(...args)
  const jsonObject = typeof json === 'string' ? JSON.parse(json) : json

  const processedProperties = Object.entries(propsMetadata).map(
    ([propName, propParams]) =>
      new Pipe<PropertyContext>()
        .add(resolveJsonValue)
        .addIf(propParams.required, assertRequiredValue)
        .add(
          propParams.deserialize
            ? applyCustomDeserialize
            : applyDefaultDeserialize
        )
        .addIf(propParams.validate, assertValidValue)
        .add(assignToInstance)
        .run({
          jsonObject,
          propName,
          propParams,
          serializableClass,
          instance: resultClass as object,
          value: undefined,
        })
  )

  processedProperties
    .filter(({ propParams }) => propParams.afterDeserialize)
    .forEach(({ propName, propParams, value }) => {
      set(
        resultClass as object,
        propName,
        propParams.afterDeserialize(resultClass, value)
      )
    })

  return resultClass
}

const resolveJsonValue: PipeStep<PropertyContext> = (context) => {
  const { jsonObject, propParams } = context
  if (propParams.paths) {
    return {
      ...context,
      value: propParams.paths.map((path) => get(jsonObject, path)),
    }
  }
  if (propParams.pathAlternatives) {
    return {
      ...context,
      value: [propParams.path, ...propParams.pathAlternatives]
        .map((path) => get(jsonObject, path))
        .find((resolvedValue) => resolvedValue != null),
    }
  }
  return { ...context, value: get(jsonObject, propParams.path) }
}

const assertRequiredValue: PipeStep<PropertyContext> = (context) => {
  assertRequired({
    json: context.jsonObject,
    propName: context.propName,
    propValue: context.value,
    serializableClass: context.serializableClass,
    propPath: context.propParams.path,
  })
  return context
}

const applyCustomDeserialize: PipeStep<PropertyContext> = (context) => ({
  ...context,
  value: context.propParams.deserialize(context.value),
})

const applyDefaultDeserialize: PipeStep<PropertyContext> = (context) => ({
  ...context,
  value: deserializeProperty(
    context.value,
    context.propParams.type,
    context.propParams.elementType,
    context.propName
  ),
})

const assertValidValue: PipeStep<PropertyContext> = (context) => {
  assertValid({
    propName: context.propName,
    propValue: context.value,
    validate: context.propParams.validate,
    serializableClass: context.serializableClass,
  })
  return context
}

const assignToInstance: PipeStep<PropertyContext> = (context) => {
  if (context.value !== undefined) {
    set(context.instance, context.propName, context.value)
  }
  return context
}

function deserializeProperty(
  value: unknown,
  toType: JsonPropertyMetadata['type'],
  elementType?: JsonPropertyMetadata['elementType'],
  propName?: string
) {
  if (value === undefined || value === null || toType === undefined) {
    return value
  }
  if (Array.isArray(toType)) {
    return toType.map((toTypeItem, index) => {
      return deserializeProperty(value[index], toTypeItem, undefined, propName)
    })
  }
  if (typeof toType === 'function') {
    switch (toType?.name) {
      case Types.Date: {
        return new Date(value as string | number | Date)
      }
      case Types.Array:
      case Types.Set: {
        assertIsArray(value, toType.name, propName)
        const values = value.map((item) => {
          const isSerializable = checkSerializable(elementType)
          return isSerializable
            ? deserialize(item as Record<string, unknown>, elementType)
            : item
        })
        return toType.name === Types.Set ? new Set(values) : values
      }
      case Types.Boolean: {
        return Boolean(value)
      }
      case Types.Number: {
        return Number(value)
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

function assertIsArray(
  value: unknown,
  typeName: string,
  propName?: string
): asserts value is unknown[] {
  if (!Array.isArray(value)) {
    throw new TypeError(
      `ts-jackson: property '${propName}' is typed as ${typeName} and expects an array json value, but received ${typeof value}`
    )
  }
}
