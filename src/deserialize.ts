import { get, set } from 'lodash'
import 'reflect-metadata'
import { parse, ReflectMetaDataKeys, RequiredPropertyError } from './common'
import { JsonPropertyMetadata } from './JsonProperty'

function deserialize<T>(
  json: Record<string, unknown>,
  serializableClass: new (...params: Array<unknown>) => T,
  ...args: Array<unknown>
): T {
  const propsMetadata: Record<
    string,
    JsonPropertyMetadata
  > = Reflect.getMetadata(ReflectMetaDataKeys.TsJackson, serializableClass)
  const result = new serializableClass(...args)
  for (const [propName, propParams] of Object.entries(propsMetadata)) {
    const jsonValue = get(json, propParams.path)
    if (jsonValue === undefined) {
      throw new RequiredPropertyError({
        json,
        propName,
        serializableClass,
        propPath: propParams.path,
      })
    }
    const parsedValue = parse(jsonValue, propParams.type)
    set(result, propName, parsedValue)
  }
  return result
}

export default deserialize
