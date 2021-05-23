/**
 * @author Ilias Gazdaliev <invimind@gmail.com>
 */
import 'reflect-metadata'
import { ReflectMetaDataKeys } from './common'

/**
 * JsonProperty params
 *
 * @param {string} path -- path pattern for the property
 * supports every pattern provided by lodash/get|set object
 * @param {boolean} required throws an Error if json is missing required property
 * @param {Function | Function[]} type Optional. In most cases there is no need to specify
 * type explicitly. You can also provide array of type constructors for tuple support.
 * @param {Function} elementType due to reflect-metadata restriction one should
 * explicitly set elementType property to correctly serialize/deserialize Array
 * or Set values
 * @param {Function} validate function for validating json values. Throws an error
 * if property fails to pass validate check
 * @param {Function} deserialize function for custom deserialization
 * @param {Function} serialize function for custom serialization
 * @param {Function} afterDeserialize takes deserialized instance and deserialized property. Should return new property value.
 */
type Params<P> = {
  path?: string
  paths?: string[]
  required?: boolean
  type?: (new (...args) => P) | { [K in keyof P]: new (...args) => P[K] }
  elementType?: new (...args) => P extends [] ? P[0] : any
  validate?: (property: P) => boolean
  deserialize?: (jsonValue: any) => P
  serialize?: (property: P) => any
  afterDeserialize?: (
    deserializedInstance: InstanceType<new (...args) => any>,
    propertyValue: any
  ) => P
  beforeSerialize?: (propertyValue: P) => any
  afterSerialize?: (serializedData: any) => any
}

export type JsonPropertyMetadata<P = any> = {
  name: string
  path: string
} & Params<P>

/**
 * Decorator. Collects annotated property metadata.
 * Takes as a param either a single string param (path),
 * Array of strings (multiple paths), or param object.
 * @param {string | |string[] | Params } arg
 */
export default function JsonProperty<P = unknown>(
  arg: Params<P> | string | string[] = {}
): (object: Object, propertyName: string) => void {
  return function (object, propertyName) {
    let params: Params<P>
    switch (true) {
      case typeof arg === 'string':
        params = { path: arg as string }
        break
      case Array.isArray(arg):
        params = {
          paths: arg as [],
        }
        break
      default:
        params = arg as Params<P>
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
