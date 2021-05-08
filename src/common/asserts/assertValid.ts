import { ValidatePropertyError } from '../index'

type Params = {
  propName: string
  propValue: unknown
  validate: (property: unknown) => boolean
  serializableClass: new (...params: Array<unknown>) => unknown
}

export default function assertValid({
  propName,
  propValue,
  validate,
  serializableClass,
}: Params): void {
  if (!validate(propValue)) {
    throw new ValidatePropertyError({
      propName,
      propValue,
      validate,
      serializableClass,
    })
  }
}
