import 'reflect-metadata'
import { ReflectMetaDataKeys } from './common'

type Params = {
  path?: string
  required?: boolean
  afterSerialize?: (value: any) => any
}

export type JsonPropertyMetadata = {
  name: string
  path: string
  type: string
}

export default function JsonProperty(
  params: Params = {}
): (object: Object, propertyName: string) => void {
  return function (object, propertyName) {
    const type = Reflect.getMetadata('design:type', object, propertyName)
    const commonMetadata: Record<string, JsonPropertyMetadata> =
      Reflect.getMetadata(ReflectMetaDataKeys.TsJackson, object.constructor) ||
      {}
    commonMetadata[propertyName] = {
      type: type.name,
      name: propertyName,
      path: propertyName,
      ...params,
    }
    Reflect.defineMetadata(
      ReflectMetaDataKeys.TsJackson,
      commonMetadata,
      object.constructor
    )
  }
}
