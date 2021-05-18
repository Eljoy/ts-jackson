import checkSerializable from '../checkSerializable'
import SerializableError from '../errors/SerializableError'

export default function assertSerializable(
  target: (new (...args) => unknown) | Function
) {
  if (!checkSerializable(target)) {
    throw new SerializableError(target)
  }
}
