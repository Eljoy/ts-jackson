import 'reflect-metadata'
import { ReflectMetaDataKeys } from './ReflectMetaDataKeys'

const SymbolWithMetadata = Symbol as { metadata?: symbol }
SymbolWithMetadata.metadata ??= Symbol.for('Symbol.metadata')

export default function getClassMetadata<T>(
  key: ReflectMetaDataKeys,
  target: any
): T | undefined {
  const legacyMetadata = Reflect.getMetadata(key, target)
  if (legacyMetadata !== undefined) {
    return legacyMetadata
  }
  return target?.[SymbolWithMetadata.metadata]?.[key]
}
