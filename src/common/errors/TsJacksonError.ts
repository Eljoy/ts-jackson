export type ErrorKind =
  'required' | 'type-mismatch' | 'validation' | 'not-serializable'

export default abstract class TsJacksonError extends Error {
  abstract readonly kind: ErrorKind
}

export function isTsJacksonError(error: unknown): error is TsJacksonError {
  return error instanceof TsJacksonError
}
