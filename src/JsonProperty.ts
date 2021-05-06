import 'reflect-metadata'
import { ReflectMetaDataKeys } from './common'

type Params<P> = {
  path?: string
  required?: boolean
  arrayValueType?: new (...params: Array<unknown>) => unknown
  validate?: (property: P) => boolean
  deserialize?: (jsonValue: unknown) => P
}

export type JsonPropertyMetadata<P = unknown> = {
  name: string
  path: string
  type: new (...params: Array<unknown>) => unknown
} & Params<P>

export default function JsonProperty<P = unknown>(
  arg: Params<P> | string = {}
): (object: Object, propertyName: string) => void {
  return function (object, propertyName) {
    const type = Reflect.getMetadata('design:type', object, propertyName)
    const params: Params<P> =
      typeof arg !== 'string'
        ? arg
        : {
            path: arg,
          }
    const commonMetadata: Record<string, JsonPropertyMetadata<P>> =
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
