import { RequiredPropertyError } from '../index'

type Params = {
  propName: string
  propPath: string
  propValue: unknown
  json: Record<string, unknown>
  serializableClass: new (...params: Array<unknown>) => unknown
}

export default function assertRequired({
  propName,
  propPath,
  propValue,
  json,
  serializableClass,
}: Params): void {
  if (propValue === undefined) {
    throw new RequiredPropertyError({
      json,
      propName,
      serializableClass,
      propPath,
    })
  }
}
