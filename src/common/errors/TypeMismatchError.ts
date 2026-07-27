import type { JsonPropertyMetadata } from '../../JsonProperty'
import TsJacksonError from './TsJacksonError'

type Params = {
  propName: string
  propValue: unknown
  type?: JsonPropertyMetadata['type']
  expected?: string
  propPath?: string
  serializableClass?: new (...params: any[]) => unknown
}

export default class TypeMismatchError extends TsJacksonError {
  readonly kind = 'type-mismatch' as const
  readonly propertyName: string
  readonly path?: string
  readonly className?: string
  readonly expected: string
  readonly value: unknown

  constructor({
    propName,
    propPath,
    propValue,
    type,
    expected,
    serializableClass,
  }: Params) {
    const className = serializableClass?.name
    const expectedName =
      expected ??
      (Array.isArray(type)
        ? `[${type.map((typeItem) => typeItem.name).join(', ')}]`
        : ((type as { name?: string })?.name ?? 'unknown'))
    const received =
      propValue === null
        ? 'null'
        : Array.isArray(propValue)
          ? 'array'
          : typeof propValue
    super(
      `Property '${propName}'${propPath ? ` (path: '${propPath}')` : ''}${
        className ? ` in ${className}` : ''
      } failed type check: expected ${expectedName}, received ${received} (${JSON.stringify(
        propValue
      )}).`
    )
    this.propertyName = propName
    this.path = propPath
    this.className = className
    this.expected = expectedName
    this.value = propValue
  }
}
