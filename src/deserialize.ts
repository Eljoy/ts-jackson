import { get, set } from 'lodash'
import 'reflect-metadata'
import { ReflectMetaDataKeys } from './common'
import { JsonPropertyMetadata } from './JsonProperty'

function deserialize<T>(
  json: Record<string, unknown>,
  type: new (...params: Array<unknown>) => T,
  ...args: Array<unknown>
): T {
  const propsMetadata: Record<
    string,
    JsonPropertyMetadata
  > = Reflect.getMetadata(ReflectMetaDataKeys.TsJackson, type)
  const result = new type(...args)
  for (const [propName, propParams] of Object.entries(propsMetadata)) {
    const jsonValue = get(json, propParams.path)
    set(result, propName, jsonValue)
  }
  return result
}

export default deserialize
