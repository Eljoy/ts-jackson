import 'reflect-metadata'
import { ReflectMetaDataKeys } from './common'

type Params = {
  path?: string
  required?: boolean
  arrayValueType?: new (...params: Array<unknown>) => unknown
  validate?: (property: unknown) => boolean
}

export type JsonPropertyMetadata = {
  name: string
  path: string
  type: new (...params: Array<unknown>) => unknown
} & Params

export default function JsonProperty(
  arg: Params | string = {}
): (object: Object, propertyName: string) => void {
  return function (object, propertyName) {
    const type = Reflect.getMetadata('design:type', object, propertyName)
    const params: Params =
      typeof arg !== 'string'
        ? arg
        : {
            path: arg,
          }
    const commonMetadata: Record<string, JsonPropertyMetadata> =
      Reflect.getMetadata(
        ReflectMetaDataKeys.TsJacksonJsonProperty,
        object.constructor
      ) || {}
    commonMetadata[propertyName] = {
      type,
      name: propertyName,
      path: propertyName,
      ...params,
    }
    Reflect.defineMetadata(
      ReflectMetaDataKeys.TsJacksonJsonProperty,
      commonMetadata,
      object.constructor
    )
  }
}
