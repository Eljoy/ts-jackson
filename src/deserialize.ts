/**
 * @author Ilias Gazdaliev <invimind@gmail.com>
 */
import get from 'lodash/get'
import set from 'lodash/set'
import 'reflect-metadata'
import {
  assertPropertyType,
  assertRequired,
  assertSerializable,
  assertValid,
  checkSerializable,
  getClassMetadata,
  getEffectivePath,
  Pipe,
  PipeStep,
  ReflectMetaDataKeys,
  TypeMismatchError,
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
  return deserializeInternal(json, serializableClass, args)
}

export function deserializeInternal<T, U extends Array<unknown>>(
  json: Record<string, unknown> | string,
  serializableClass: new (...args: [...U]) => T,
  args: U,
  onPropertyError?: (error: Error) => void
): T {
  assertSerializable(serializableClass)
  const propsMetadata =
    getClassMetadata<Record<string, JsonPropertyMetadata>>(
      ReflectMetaDataKeys.TsJacksonJsonProperty,
      serializableClass
    ) || {}
  const resultClass = new serializableClass(...args)
  const jsonObject = typeof json === 'string' ? JSON.parse(json) : json

  const processedProperties = Object.entries(propsMetadata)
    .map(([propName, propParams]) =>
      collectingErrors(onPropertyError, () =>
        new Pipe<PropertyContext>()
          .add(resolveJsonValue)
          .addIf(propParams.required, assertRequiredValue)
          .addIf(propParams.beforeDeserialize, applyBeforeDeserialize)
          .addIf(
            propParams.strict && !propParams.deserialize,
            assertValueMatchesType
          )
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
    )
    .filter((context): context is PropertyContext => context !== undefined)

  processedProperties
    .filter(({ propParams }) => propParams.afterDeserialize)
    .forEach(({ propName, propParams, value }) => {
      collectingErrors(onPropertyError, () =>
        set(
          resultClass as object,
          propName,
          propParams.afterDeserialize(resultClass, value)
        )
      )
    })

  return resultClass
}

function collectingErrors<R>(
  onPropertyError: ((error: Error) => void) | undefined,
  run: () => R
): R | undefined {
  if (!onPropertyError) {
    return run()
  }
  try {
    return run()
  } catch (error) {
    onPropertyError(error as Error)
    return undefined
  }
}

const resolveJsonValue: PipeStep<PropertyContext> = (context) => {
  const { jsonObject, propParams, serializableClass } = context
  if (propParams.paths) {
    return {
      ...context,
      value: propParams.paths.map((path) => get(jsonObject, path)),
    }
  }
  const effectivePath = getEffectivePath(propParams, serializableClass)
  if (propParams.pathAlternatives) {
    return {
      ...context,
      value: [effectivePath, ...propParams.pathAlternatives]
        .map((path) => get(jsonObject, path))
        .find((resolvedValue) => resolvedValue != null),
    }
  }
  return { ...context, value: get(jsonObject, effectivePath) }
}

const assertRequiredValue: PipeStep<PropertyContext> = (context) => {
  assertRequired({
    json: context.jsonObject,
    propName: context.propName,
    propValue: context.value,
    serializableClass: context.serializableClass,
    propPath: getEffectivePath(context.propParams, context.serializableClass),
  })
  return context
}

const assertValueMatchesType: PipeStep<PropertyContext> = (context) => {
  assertPropertyType({
    propName: context.propName,
    propPath: context.propParams.path,
    propValue: context.value,
    type: context.propParams.type,
    elementType: context.propParams.elementType,
    serializableClass: context.serializableClass,
  })
  return context
}

const applyBeforeDeserialize: PipeStep<PropertyContext> = (context) => ({
  ...context,
  value: context.propParams.beforeDeserialize(context.value),
})

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
    context.propName,
    context.propParams.resolveType
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
  propName?: string,
  resolveType?: JsonPropertyMetadata['resolveType']
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
        const values = value.map((item) =>
          deserializeItem(item, elementType, resolveType)
        )
        return toType.name === Types.Set ? new Set(values) : values
      }
      case Types.Map: {
        assertIsObject(value, toType.name, propName)
        return new Map(
          Object.entries(value).map(([key, item]) => [
            key,
            deserializeItem(item, elementType, resolveType),
          ])
        )
      }
      case Types.Object: {
        if (!elementType && !resolveType) {
          return value
        }
        assertIsObject(value, toType.name, propName)
        const dictionary: Record<string, unknown> = {}
        for (const [key, item] of Object.entries(value)) {
          dictionary[key] = deserializeItem(item, elementType, resolveType)
        }
        return dictionary
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
        const concreteType = resolveType?.(value) ?? toType
        return checkSerializable(concreteType)
          ? deserialize(value as Record<string, unknown>, concreteType)
          : value
      }
    }
  }
}

function deserializeItem(
  item: unknown,
  elementType?: JsonPropertyMetadata['elementType'],
  resolveType?: JsonPropertyMetadata['resolveType']
) {
  const itemType = resolveType?.(item) ?? elementType
  return checkSerializable(itemType)
    ? deserialize(item as Record<string, unknown>, itemType)
    : item
}

function assertIsArray(
  value: unknown,
  typeName: string,
  propName?: string
): asserts value is unknown[] {
  if (!Array.isArray(value)) {
    throw new TypeMismatchError({
      propName,
      propValue: value,
      expected: typeName,
    })
  }
}

function assertIsObject(
  value: unknown,
  typeName: string,
  propName?: string
): asserts value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new TypeMismatchError({
      propName,
      propValue: value,
      expected: typeName,
    })
  }
}
