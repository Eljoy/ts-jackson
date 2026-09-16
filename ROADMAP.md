# Roadmap

## 2.1

### Headline: `createSerializer(options)`

Configurable serializer instance; the existing top-level exports become the
default instance. No breaking changes.

```typescript
const api = createSerializer({
  strict: true,                         // default for all classes
  formatPropertyName: camelToSnakeCase, // global naming strategy
  nullishPolicy: {
    undefined: 'remove',                // 'keep' | 'remove'
    null: 'keep',                       // 'keep' | 'remove'
  },
  onTypeMismatch: 'throw',              // 'coerce' | 'throw' | 'keep-default'
})
```

- `strict` — global default, overridable per class and per property
- `formatPropertyName` — global naming strategy, overridable per class
- `nullishPolicy` — serialization handling of `undefined`/`null` values;
  fixes the current `key: undefined` output quirk properly
- `onTypeMismatch` — third error-handling stance alongside throw-fast and
  collect-all (`safeDeserialize`): `'keep-default'` degrades gracefully by
  keeping the property default and continuing
- Options hierarchy: instance → class (`@Serializable`) → property
  (`@JsonProperty`)

### Features

- Enum support: `@JsonProperty({ enum: Color })` — membership validation on
  deserialize, `TypeMismatchError` listing allowed values
- `serializeToFormData(instance)` — multipart/FormData output with dot-notation
  nesting for file-upload payloads
- Reserved scope (~20%) for the first user-filed feature requests

### Internal quality

- `strict: true` in tsconfig (improves published `.d.ts` precision and
  `SafeResult` narrowing)
- Property-based round-trip tests with fast-check:
  `deserialize(serialize(x))` equals `x` across generated shapes

### Docs & hygiene

- `CHANGELOG.md` (backfill 2.0.0, maintain going forward)
- README "How it compares" section (class-transformer,
  typescript-json-serializer, ts-serializable, zod)
- Resolve js-yaml Dependabot alert
- Follow-up comments on closed issues #6-#9

## Later / needs traction evidence

- JSON Schema generation from decorator metadata (`toJsonSchema(Track)`) —
  single source of truth for parsing and API contracts
- Zero-dependency build: vendor lodash `get`/`set` with ported test vectors
- Configurable date format handling
- `preserveModules` dist layout

## Out of scope

- Serialization groups/views and class-to-class transformation
  (class-transformer territory; conflicts with the API-adapter focus)
