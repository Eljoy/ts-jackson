import 'reflect-metadata'
import { ReflectMetaDataKeys } from './common'

export type SerializableMetadata = {
  className: string
}

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
 * @returns {Function} Class decorator function.
 */
export default function Serializable(): SerializableDecorator {
  return function (
    target: new (...args: any[]) => unknown,
    context?: ClassDecoratorContext
  ): void {
    if (context) {
      const store = context.metadata as Record<string, SerializableMetadata>
      store[ReflectMetaDataKeys.TsJacksonSerializable] = {
        className: String(context.name),
      }
      return
    }

    const metadata: SerializableMetadata = {
      className: target.name,
    }

    Reflect.defineMetadata(
      ReflectMetaDataKeys.TsJacksonSerializable,
      metadata,
      target
    )
  } as SerializableDecorator
}
