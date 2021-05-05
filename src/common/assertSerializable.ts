import checkSerializable from './checkSerializable'
import SerializableError from './SerializableError'

export default function assertSerializable(target: Object) {
  if (!checkSerializable(target)) {
    throw new SerializableError(target)
  }
}
