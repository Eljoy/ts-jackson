import 'reflect-metadata'
import { ReflectMetaDataKeys } from './common'

/**
 * Type definition for JsonProperty parameters.
 */
type Constructor<T> = new (...args: any[]) => T

type TypeRef<T> = Constructor<T> | (() => Constructor<T>)

type Params<P> = {
  path?: string
  paths?: string[]
  pathAlternatives?: string[]
  required?: boolean
  strict?: boolean
  default?: any
  access?: 'deserialize-only' | 'serialize-only'
  type?: TypeRef<P> | { [K in keyof P]: Constructor<P[K]> }
  elementType?: TypeRef<P extends [] ? P[0] : any>
  resolveType?: (json: any) => Constructor<any>
  validate?: (property: P) => boolean
  beforeDeserialize?: (jsonValue: any) => any
  deserialize?: (jsonValue: any) => P
  serialize?: (property: P) => any
  afterDeserialize?: (
    deserializedInstance: InstanceType<new (...args: any[]) => any>,
    propertyValue: any
  ) => P
  beforeSerialize?: (propertyValue: P) => any
  afterSerialize?: (serializedData: any) => any
}

export type JsonPropertyMetadata<P = any> = {
  name: string
  path: string
  explicitPath: boolean
} & Params<P>

type JsonPropertyDecorator = ((target: Object, propertyName: string) => void) &
  ((value: undefined, context: ClassFieldDecoratorContext) => void)

/**
 * Decorator for collecting annotated property metadata.
 * Accepts a string, array of strings, or a Params object.
 *
 * @param {string | string[] | Params<P>} arg - The decorator argument.
 */
export default function JsonProperty<P = unknown>(
  arg: Params<P> | string | string[] = {}
): JsonPropertyDecorator {
  return function (
    target: Object | undefined,
    propertyNameOrContext: string | ClassFieldDecoratorContext
  ): void {
    let params: Params<P> =
      typeof arg === 'string'
        ? { path: arg }
        : Array.isArray(arg)
          ? { paths: arg }
          : arg

    if (typeof propertyNameOrContext === 'object') {
      const context = propertyNameOrContext
      const propertyName = String(context.name)
      const metadata: JsonPropertyMetadata<P> = {
        name: propertyName,
        path: params.path || propertyName,
        explicitPath: Boolean(params.path),
        ...params,
        type: params.type ?? (params.elementType ? (Array as any) : undefined),
      }

      const store = context.metadata as Record<
        string,
        Record<string, JsonPropertyMetadata<P>>
      >
      const existingMetadata = Object.prototype.hasOwnProperty.call(
        store,
        ReflectMetaDataKeys.TsJacksonJsonProperty
      )
        ? store[ReflectMetaDataKeys.TsJacksonJsonProperty]
        : { ...store[ReflectMetaDataKeys.TsJacksonJsonProperty] }

      existingMetadata[propertyName] = metadata
      store[ReflectMetaDataKeys.TsJacksonJsonProperty] = existingMetadata
      return
    }

    const propertyName = propertyNameOrContext
    const metadata: JsonPropertyMetadata<P> = {
      name: propertyName,
      path: params.path || propertyName,
      explicitPath: Boolean(params.path),
      ...params,
      type:
        params.type || Reflect.getMetadata('design:type', target, propertyName),
    }

    const existingMetadata: Record<
      string,
      JsonPropertyMetadata<P>
    > = Reflect.getOwnMetadata(
      ReflectMetaDataKeys.TsJacksonJsonProperty,
      target.constructor
    ) || {
      ...Reflect.getMetadata(
        ReflectMetaDataKeys.TsJacksonJsonProperty,
        target.constructor
      ),
    }

    existingMetadata[propertyName] = metadata

    Reflect.defineMetadata(
      ReflectMetaDataKeys.TsJacksonJsonProperty,
      existingMetadata,
      target.constructor
    )
  } as JsonPropertyDecorator
}
