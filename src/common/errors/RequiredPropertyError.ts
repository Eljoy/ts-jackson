import TsJacksonError from './TsJacksonError'

type Params = {
  propName: string
  propPath: string
  json: Record<string, unknown>
  serializableClass: new (...params: any[]) => any
}

export default class RequiredPropertyError extends TsJacksonError {
  readonly kind = 'required' as const
  readonly propertyName: string
  readonly path: string
  readonly className: string

  constructor({ propName, propPath, json, serializableClass }: Params) {
    const className = serializableClass.name
    const formattedJson = JSON.stringify(json, null, 2)
    super(
      `Property '${propName}' (path: '${propPath}') is required in ${className} but missing in provided JSON: ${formattedJson}.`
    )
    this.propertyName = propName
    this.path = propPath
    this.className = className
  }
}
