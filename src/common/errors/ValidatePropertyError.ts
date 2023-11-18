type Params = {
  propName: string
  propValue: unknown
  validate: (property: unknown) => boolean
  serializableClass: new (...params: Array<unknown>) => unknown
}

export default class ValidatePropertyError extends Error {
  constructor({ propName, propValue, validate, serializableClass }: Params) {
    const className = serializableClass.name
    const validationFunctionName = validate.name || 'anonymous function'
    const message = `Property '${propName}' with value ${propValue} in ${className} failed to pass the validation check by ${validationFunctionName}.`
    super(message)
    Object.setPrototypeOf(this, ValidatePropertyError.prototype)
  }
}
