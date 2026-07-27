import TsJacksonError from './TsJacksonError'

export default class SerializableError extends TsJacksonError {
  readonly kind = 'not-serializable' as const
  readonly className: string

  constructor(target: (new (...args) => unknown) | Function) {
    super(`${target.name} class should annotated with @Serializable decorator`)
    this.name = 'SerializableError'
    this.className = target.name
  }
}
