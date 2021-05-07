type Params = {
  propName: string
  propPath: string
  json: Record<string, unknown>
  serializableClass: new (...params: Array<unknown>) => unknown
}

export default class RequiredPropertyError extends Error {
  constructor({ propName, propPath, json, serializableClass }: Params) {
    const message = `Property '${propName}' is required in ${
      serializableClass.name
    }
     but missing in ${JSON.stringify(json)} by path ${propPath}.`
    super(message)
  }
}
