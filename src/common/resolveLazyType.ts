export default function resolveLazyType<T>(type: T): T {
  return typeof type === 'function' &&
    !(type as { prototype?: unknown }).prototype
    ? (type as unknown as () => T)()
    : type
}
