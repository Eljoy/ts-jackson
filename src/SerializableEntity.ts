import deserialize from './deserialize'
import Serializable from './Serializable'
import serialize from './serialize'

/**
 * @class
 * Utility class that encapsulates deserialize, serialize
 * and the need for @Serializable explicit decoration.
 */
@Serializable()
export default class SerializableEntity {
  stringify(): string {
    return JSON.stringify(this.serialize())
  }

  serialize(): Record<string, unknown> {
    return serialize(this)
  }

  static deserialize<T, U extends Array<unknown>>(
    this: { new (...params: [...U]): T },
    json: Record<string, unknown>,
    ...args: U
  ): T {
    return deserialize<T, U>(json, this, ...args)
  }
}
