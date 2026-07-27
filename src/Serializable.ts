import 'reflect-metadata'
import { ReflectMetaDataKeys } from './common'

export type SerializableMetadata = {
  className: string
}

/**
 * Decorator for marking classes as serializable. It assigns metadata
 * to the class indicating its name.
 *
 * @returns {Function} Class decorator function.
 */
export default function Serializable(): (
  target: new (...args: any[]) => unknown
) => void {
  return (target) => {
    const metadata: SerializableMetadata = {
      className: target.name,
    }

    Reflect.defineMetadata(
      ReflectMetaDataKeys.TsJacksonSerializable,
      metadata,
      target
    )
  }
}
