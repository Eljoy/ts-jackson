/**
 * @author Ilias Gazdaliev <invimind@gmail.com>
 */
import 'reflect-metadata'
import { ReflectMetaDataKeys } from './common'

type Params = {}

export type SerializableMetadata = {
  className: string
} & Params

/**
 * Decorator for marking serializable classes
 *
 * @returns {Record<string, unknown>} json
 */
export default function Serializable(): (
  target: new (...args) => unknown
) => void {
  return (target) => {
    Reflect.defineMetadata(
      ReflectMetaDataKeys.TsJacksonSerializable,
      { className: target.name },
      target
    )
  }
}
