/**
 * @author Ilias Gazdaliev <invimind@gmail.com>
 */
import 'reflect-metadata'
import { ReflectMetaDataKeys } from './common'

/**
 * JsonProperty params
 *
 * @param {string} path -- path pattern for the required property
 * supports every pattern provided by lodash/get|set object
 * @param {boolean} required throws an Error if json is missing required property
 * @param {Function} type Optional. In most cases there is no need to specify
 * type explicitly
 * @param {Function} elementType due to reflect-metadata restriction one should
 * explicitly set elementType property to correctly serialize/deserialize Array
 * or Set values
 * @param {Function} validate function for validating json values. Throws an error
 * if property fails to pass validate check
 * @param {Function} deserialize function for custom deserialization
 * @param {Function} serialize function for custom serialization
 */
type Params<P> = {
  path?: string
  required?: boolean
  type?: new (...params: Array<unknown>) => unknown
  elementType?: new (...params: Array<unknown>) => unknown
  validate?: (property: P) => boolean
  deserialize?: (jsonValue: unknown) => P
  serialize?: (property: P) => unknown
}

export type JsonPropertyMetadata<P = unknown> = {
  name: string
  path: string
  type: new (...params: Array<unknown>) => unknown
} & Params<P>

/**
 * Function to deserialize json to Serializable class
 *
 * @param {string | Params} arg
 */
export default function JsonProperty<P = unknown>(
  arg: Params<P> | string = {}
): (object: Object, propertyName: string) => void {
  return function (object, propertyName) {
    const params: Params<P> =
      typeof arg !== 'string'
        ? arg
        : {
            path: arg,
          }
    const type =
      params.type || Reflect.getMetadata('design:type', object, propertyName)
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
