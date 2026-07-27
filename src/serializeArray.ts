import serialize from './serialize'

/**
 * Function to serialize an array of Serializable
 * class instances to a json array
 *
 * @param instances serializable instances
 * @returns {Array<Record<string, unknown>>} json array
 */
export default function serializeArray<T extends new (...args) => unknown>(
  instances: Array<InstanceType<T>>
): Array<Record<string, unknown>> {
  return instances.map((instance) => serialize(instance))
}
