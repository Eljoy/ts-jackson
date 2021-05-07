import Serializable from '../Serializable'

export default class SerializableError extends Error {
  constructor(target: (new (...args: unknown[]) => unknown) | Function) {
    super()
    this.name = 'SerializableError'
    this.message = `${target.name} class should annotated with @${Serializable.name} decorator`
  }
}
