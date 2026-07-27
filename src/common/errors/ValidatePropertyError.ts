import TsJacksonError from './TsJacksonError'

type Params = {
  propName: string
  propValue: unknown
  validate: (property: unknown) => boolean
  serializableClass: new (...params: Array<unknown>) => unknown
}

export default class ValidatePropertyError extends TsJacksonError {
  readonly kind = 'validation' as const
  readonly propertyName: string
  readonly className: string
  readonly value: unknown

  constructor({ propName, propValue, validate, serializableClass }: Params) {
    const className = serializableClass.name
    const validationFunctionName = validate.name || 'anonymous function'
    super(
      `Property '${propName}' with value ${propValue} in ${className} failed to pass the validation check by ${validationFunctionName}.`
    )
    this.propertyName = propName
    this.className = className
    this.value = propValue
  }
}
