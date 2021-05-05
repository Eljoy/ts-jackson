import { get, set } from 'lodash'
import 'reflect-metadata'
import {
  checkSerializable,
  parse,
  ReflectMetaDataKeys,
  RequiredPropertyError,
} from './common'
import assertSerializable from './common/assertSerializable'
import { JsonPropertyMetadata } from './JsonProperty'

export default function deserialize<T>(
  json: Record<string, unknown>,
  serializableClass: new (...params: Array<unknown>) => T,
  ...args: Array<unknown>
): T {
  const propsMetadata: Record<
    string,
    JsonPropertyMetadata
  > = Reflect.getMetadata(ReflectMetaDataKeys.TsJackson, serializableClass)
  assertSerializable(serializableClass)
  const result = new serializableClass(...args)
  for (const [propName, propParams] of Object.entries(propsMetadata)) {
    const jsonValue = get(json, propParams.path)
    if (propParams.required && jsonValue === undefined) {
      throw new RequiredPropertyError({
        json,
        propName,
        serializableClass,
        propPath: propParams.path,
      })
    }
    const isSerializable = checkSerializable(propParams.type)
    const parsedValue = isSerializable
      ? deserialize(jsonValue, propParams.type)
      : parse(jsonValue, propParams.type)
    set(result, propName, parsedValue)
  }
  return result
}
