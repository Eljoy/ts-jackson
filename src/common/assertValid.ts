import { ValidatePropertyError } from './index'
import { ConstructorType } from './types.d'

type Params = {
  propName: string
  propValue: unknown
  validate: (property: unknown) => boolean
  serializableClass: ConstructorType
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
