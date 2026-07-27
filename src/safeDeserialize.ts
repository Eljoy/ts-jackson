import { SafeResult } from './common'
import { deserializeInternal } from './deserialize'

/**
 * Non-throwing variant of deserialize. Collects every property error
 * instead of failing on the first one.
 *
 * @returns {SafeResult} discriminated union: { success: true, data }
 * or { success: false, errors }
 */
export default function safeDeserialize<T, U extends Array<unknown>>(
  json: Record<string, unknown> | string,
  serializableClass: new (...args: [...U]) => T,
  ...args: U
): SafeResult<T> {
  const errors: Error[] = []
  try {
    const data = deserializeInternal(json, serializableClass, args, (error) =>
      errors.push(error)
    )
    return errors.length ? { success: false, errors } : { success: true, data }
  } catch (error) {
    errors.push(error as Error)
    return { success: false, errors }
  }
}
