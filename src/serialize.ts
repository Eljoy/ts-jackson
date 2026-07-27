/**
 * @author Ilias Gazdaliev <invimind@gmail.com>
 */
import set from 'lodash/set'
import {
  assertSerializable,
  checkSerializable,
  getClassMetadata,
  getEffectivePath,
  Pipe,
  PipeStep,
  ReflectMetaDataKeys,
  resolveLazyType,
  Types,
} from './common'
import { JsonPropertyMetadata } from './JsonProperty'

type PropertyContext = {
  json: Record<string, unknown>
  propName: string
  propParams: JsonPropertyMetadata
  instance: object
  value: unknown
  type?: JsonPropertyMetadata['type']
}

/**
 * Function to serialize Serializable class to json
 *
 * @param {Function} instance serializable instance
 * @returns {Record<string, unknown>} json
 */
export default function serialize<T extends new (...args) => unknown>(
  instance: InstanceType<T>
): Record<string, unknown> {
  return serializeInternal(instance)
}

export function serializeInternal<T extends new (...args) => unknown>(
  instance: InstanceType<T>,
  onPropertyError?: (error: Error) => void
): Record<string, unknown> {
  assertSerializable(instance.constructor)
  const propsMetadata =
    getClassMetadata<Record<string, JsonPropertyMetadata>>(
      ReflectMetaDataKeys.TsJacksonJsonProperty,
      instance.constructor
    ) || {}
  const json = {}
  Object.entries(propsMetadata).forEach(([propName, propParams]) => {
    if (propParams.access === 'deserialize-only') {
      return
    }
    const runPipe = () =>
      new Pipe<PropertyContext>()
        .add(resolveInstanceValue)
        .addIf(propParams.beforeSerialize, applyBeforeSerialize)
        .add(
          propParams.serialize ? applyCustomSerialize : applyDefaultSerialize
        )
        .addIf(propParams.afterSerialize, applyAfterSerialize)
        .add(writeToJson)
        .run({
          json,
          propName,
          propParams,
          instance: instance as object,
          value: undefined,
        })
    if (!onPropertyError) {
      runPipe()
      return
    }
    try {
      runPipe()
    } catch (error) {
      onPropertyError(error as Error)
    }
  })
  return json
}

const resolveInstanceValue: PipeStep<PropertyContext> = (context) => ({
  ...context,
  value: context.instance[context.propName],
  type: context.propParams.type,
})

const applyBeforeSerialize: PipeStep<PropertyContext> = (context) => {
  const value = context.propParams.beforeSerialize(context.value)
  return { ...context, value, type: value?.constructor }
}

const applyCustomSerialize: PipeStep<PropertyContext> = (context) => ({
  ...context,
  value: context.propParams.serialize(context.value),
})

const applyDefaultSerialize: PipeStep<PropertyContext> = (context) => ({
  ...context,
  value: serializeProperty(context.value, context.type),
})

const applyAfterSerialize: PipeStep<PropertyContext> = (context) => ({
  ...context,
  value: context.propParams.afterSerialize(context.value),
})

const writeToJson: PipeStep<PropertyContext> = (context) => {
  if (context.propParams.paths) {
    context.propParams.paths.forEach((path, index) => {
      set(context.json, path, (context.value as unknown[])[index])
    })
  } else {
    set(
      context.json,
      getEffectivePath(context.propParams, context.instance.constructor),
      context.value
    )
  }
  return context
}

function serializeProperty(
  value: unknown,
  typeRef: JsonPropertyMetadata['type']
) {
  const type = resolveLazyType(typeRef)
  if (value === undefined || value === null) {
    return value
  }
  if (type === undefined) {
    return checkSerializable((value as object).constructor)
      ? serialize(value as Record<string, unknown>)
      : value
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
        ).map((item) => serializeItem(item))
      }
      case Types.Map: {
        const result: Record<string, unknown> = {}
        ;(value as Map<unknown, unknown>).forEach((item, key) => {
          result[String(key)] = serializeItem(item)
        })
        return result
      }
      case Types.Object: {
        if (checkSerializable((value as object).constructor)) {
          return serialize(value as Record<string, unknown>)
        }
        if (typeof value !== 'object' || value.constructor !== Object) {
          return value
        }
        const result: Record<string, unknown> = {}
        for (const [key, item] of Object.entries(value)) {
          result[key] = serializeItem(item)
        }
        return result
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

function serializeItem(item: unknown) {
  return checkSerializable((item as object)?.constructor)
    ? serialize(item as Record<string, unknown>)
    : item
}
