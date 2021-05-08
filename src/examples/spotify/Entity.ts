import { deserialize, Serializable, serialize } from '../../../index'

@Serializable()
export default class Entity {
  serialize(): Record<string, unknown> {
    return serialize(this)
  }

  toString(): string {
    return JSON.stringify(this.serialize())
  }

  static deserialize(entityJson: Record<string, unknown>) {
    return deserialize(entityJson, this)
  }
}
