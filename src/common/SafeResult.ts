export type SafeResult<T> =
  { success: true; data: T } | { success: false; errors: Error[] }
