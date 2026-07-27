import deserialize from './deserialize'

/**
 * Function to deserialize a json array to an array
 * of Serializable class instances
 *
 * @param {Array<Record<string, unknown>> | string} json
 * @param serializableClass Class to which each json item should be deserialized
 * @param args arguments to be provided to the constructor of each instance
 */
export default function deserializeArray<T, U extends Array<unknown>>(
  json: Array<Record<string, unknown>> | string,
  serializableClass: new (...args: [...U]) => T,
  ...args: U
): T[] {
  const jsonArray = typeof json === 'string' ? JSON.parse(json) : json
  if (!Array.isArray(jsonArray)) {
    throw new TypeError(
      `ts-jackson: deserializeArray expects an array json value, but received ${typeof jsonArray}`
    )
  }
  return jsonArray.map((item) => deserialize(item, serializableClass, ...args))
}
