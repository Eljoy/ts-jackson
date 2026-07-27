type Params = {
  propName: string
  propPath: string
  json: Record<string, unknown>
  serializableClass: new (...params: any[]) => any
}

export default class RequiredPropertyError extends Error {
  constructor({ propName, propPath, json, serializableClass }: Params) {
    const className = serializableClass.name
    const formattedJson = JSON.stringify(json, null, 2) // Prettify the JSON output
    const message = `Property '${propName}' (path: '${propPath}') is required in ${className} but missing in provided JSON: ${formattedJson}.`

    super(message)
  }
}
