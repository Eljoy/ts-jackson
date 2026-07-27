import { SafeResult } from './common'
import { serializeInternal } from './serialize'

/**
 * Non-throwing variant of serialize. Collects every property error
 * instead of failing on the first one.
 *
 * @returns {SafeResult} discriminated union: { success: true, data }
 * or { success: false, errors }
 */
export default function safeSerialize<T extends new (...args) => unknown>(
  instance: InstanceType<T>
): SafeResult<Record<string, unknown>> {
  const errors: Error[] = []
  try {
    const data = serializeInternal(instance, (error) => errors.push(error))
    return errors.length ? { success: false, errors } : { success: true, data }
  } catch (error) {
    errors.push(error as Error)
    return { success: false, errors }
  }
}
