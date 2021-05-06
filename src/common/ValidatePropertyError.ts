type Params = {
  propName: string
  propValue: unknown
  validate: (property: unknown) => boolean
  serializableClass: new (...params: Array<unknown>) => unknown
}

export default class ValidatePropertyError extends Error {
  constructor({ propName, propValue, validate, serializableClass }: Params) {
    const message = `Property '${propName}' = ${propValue} in ${serializableClass.name}
    failed to path ${validate} check`
    super(message)
  }
}
