import { SafeResult } from './common'
import { deserializeInternal } from './deserialize'

/**
 * Non-throwing variant of deserializeArray. Collects every error
 * across all items instead of failing on the first one.
 *
 * @returns {SafeResult} discriminated union: { success: true, data }
 * or { success: false, errors }
 */
export default function safeDeserializeArray<T, U extends Array<unknown>>(
  json: Array<Record<string, unknown>> | string,
  serializableClass: new (...args: [...U]) => T,
  ...args: U
): SafeResult<T[]> {
  const errors: Error[] = []
  try {
    const jsonArray = typeof json === 'string' ? JSON.parse(json) : json
    if (!Array.isArray(jsonArray)) {
      throw new TypeError(
        `ts-jackson: safeDeserializeArray expects an array json value, but received ${typeof jsonArray}`
      )
    }
    const data = jsonArray.map((item) =>
      deserializeInternal(item, serializableClass, args, (error) =>
        errors.push(error)
      )
    )
    return errors.length ? { success: false, errors } : { success: true, data }
  } catch (error) {
    errors.push(error as Error)
    return { success: false, errors }
  }
}
