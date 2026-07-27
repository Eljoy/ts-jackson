function splitWords(propertyName: string, delimiter: string): string {
  return propertyName
    .replace(/([A-Z]+)([A-Z][a-z])/g, `$1${delimiter}$2`)
    .replace(/([a-z0-9])([A-Z])/g, `$1${delimiter}$2`)
    .toLowerCase()
}

export const camelToSnakeCase = (propertyName: string): string =>
  splitWords(propertyName, '_')

export const camelToKebabCase = (propertyName: string): string =>
  splitWords(propertyName, '-')

export const camelToPascalCase = (propertyName: string): string =>
  propertyName.charAt(0).toUpperCase() + propertyName.slice(1)
