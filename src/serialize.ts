/**
 * @author Ilias Gazdaliev <invimind@gmail.com>
 */
import set from 'lodash/set'
import {
  assertSerializable,
  checkSerializable,
  Pipe,
  PipeStep,
  ReflectMetaDataKeys,
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
  assertSerializable(instance.constructor)
  const propsMetadata: Record<string, JsonPropertyMetadata> =
    Reflect.getMetadata(
      ReflectMetaDataKeys.TsJacksonJsonProperty,
      instance.constructor
    )
  const json = {}
  Object.entries(propsMetadata).forEach(([propName, propParams]) =>
    new Pipe<PropertyContext>()
      .add(resolveInstanceValue)
      .addIf(propParams.beforeSerialize, applyBeforeSerialize)
      .add(propParams.serialize ? applyCustomSerialize : applyDefaultSerialize)
      .addIf(propParams.afterSerialize, applyAfterSerialize)
      .add(writeToJson)
      .run({
        json,
        propName,
        propParams,
        instance: instance as object,
        value: undefined,
      })
  )
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
    set(context.json, context.propParams.path, context.value)
  }
  return context
}

function serializeProperty(value: unknown, type: JsonPropertyMetadata['type']) {
  if (value === undefined || value === null) {
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
          const isSerializable = checkSerializable(item?.constructor)
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
