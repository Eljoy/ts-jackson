import type { JsonPropertyMetadata } from '../../JsonProperty'

type Params = {
  propName: string
  propPath: string
  propValue: unknown
  type: JsonPropertyMetadata['type']
  serializableClass: new (...params: any[]) => unknown
}

export default class TypeMismatchError extends Error {
  constructor({
    propName,
    propPath,
    propValue,
    type,
    serializableClass,
  }: Params) {
    const className = serializableClass.name
    const expected = Array.isArray(type)
      ? `[${type.map((typeItem) => typeItem.name).join(', ')}]`
      : type.name
    const received = propValue === null ? 'null' : typeof propValue
    super(
      `Property '${propName}' (path: '${propPath}') in ${className} failed strict type check: expected ${expected}, received ${received} (${JSON.stringify(
        propValue
      )}).`
    )
    Object.setPrototypeOf(this, TypeMismatchError.prototype)
  }
}
