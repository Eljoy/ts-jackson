import Serializable from '../Serializable'

export default class SerializableError extends Error {
  constructor(target: Object) {
    const message = `${target} should annotated with ${Serializable.name} decorator`
    super(message)
  }
}
