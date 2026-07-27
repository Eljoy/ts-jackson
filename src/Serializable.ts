import 'reflect-metadata'
import { ReflectMetaDataKeys } from './common'

export type SerializableParams = {
  formatPropertyName?: (propertyName: string) => string
  strict?: boolean
}

export type SerializableMetadata = {
  className: string
} & SerializableParams

type SerializableDecorator = ((
  target: new (...args: any[]) => unknown
) => void) &
  ((
    value: new (...args: any[]) => unknown,
    context: ClassDecoratorContext
  ) => void)

/**
 * Decorator for marking classes as serializable. It assigns metadata
 * to the class indicating its name.
 *
 * @param {SerializableParams} params optional class-level configuration.
 * formatPropertyName maps property names to json paths for properties
 * without an explicit path and is inherited by subclasses.
 * @returns {Function} Class decorator function.
 */
export default function Serializable(
  params: SerializableParams = {}
): SerializableDecorator {
  return function (
    target: new (...args: any[]) => unknown,
    context?: ClassDecoratorContext
  ): void {
    if (context) {
      const store = context.metadata as Record<string, SerializableMetadata>
      const inherited = store[ReflectMetaDataKeys.TsJacksonSerializable]
      store[ReflectMetaDataKeys.TsJacksonSerializable] = {
        className: String(context.name),
        formatPropertyName:
          params.formatPropertyName ?? inherited?.formatPropertyName,
        strict: params.strict ?? inherited?.strict,
      }
      return
    }

    const inherited: SerializableMetadata | undefined = Reflect.getMetadata(
      ReflectMetaDataKeys.TsJacksonSerializable,
      target
    )
    const metadata: SerializableMetadata = {
      className: target.name,
      formatPropertyName:
        params.formatPropertyName ?? inherited?.formatPropertyName,
      strict: params.strict ?? inherited?.strict,
    }

    Reflect.defineMetadata(
      ReflectMetaDataKeys.TsJacksonSerializable,
      metadata,
      target
    )
  } as SerializableDecorator
}
