import checkSerializable from './checkSerializable'
import SerializableError from './SerializableError'

export default function assertSerializable(
  target: (new (...args: unknown[]) => unknown) | Function
) {
  if (!checkSerializable(target)) {
    throw new SerializableError(target)
  }
}
