import type { JsonPropertyMetadata } from '../../JsonProperty'
import TypeMismatchError from '../errors/TypeMismatchError'
import { Types } from '../Types'

type Params = {
  propName: string
  propPath: string
  propValue: unknown
  type: JsonPropertyMetadata['type']
  elementType?: JsonPropertyMetadata['elementType']
  serializableClass: new (...params: any[]) => unknown
}

export default function assertPropertyType(params: Params): void {
  if (!matchesType(params.propValue, params.type, params.elementType)) {
    throw new TypeMismatchError(params)
  }
}

function matchesType(
  value: unknown,
  type: JsonPropertyMetadata['type'],
  elementType?: JsonPropertyMetadata['elementType']
): boolean {
  if (value === undefined || value === null || type === undefined) {
    return true
  }
  if (Array.isArray(type)) {
    return (
      Array.isArray(value) &&
      type.every((typeItem, index) => matchesType(value[index], typeItem))
    )
  }
  switch (type.name) {
    case Types.Number:
      return typeof value === 'number'
    case Types.String:
      return typeof value === 'string'
    case Types.Boolean:
      return typeof value === 'boolean'
    case Types.Date:
      return (
        (typeof value === 'string' ||
          typeof value === 'number' ||
          value instanceof Date) &&
        !Number.isNaN(new Date(value as string | number | Date).getTime())
      )
    case Types.Array:
    case Types.Set:
      return (
        Array.isArray(value) &&
        value.every((item) => matchesType(item, elementType))
      )
    case Types.Map:
      return (
        isPlainObjectValue(value) &&
        Object.values(value).every((item) => matchesType(item, elementType))
      )
    case Types.Object:
      if (!elementType) {
        return true
      }
      return (
        isPlainObjectValue(value) &&
        Object.values(value).every((item) => matchesType(item, elementType))
      )
    default:
      return isPlainObjectValue(value)
  }
}

function isPlainObjectValue(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
