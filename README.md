# ts-jackson

[![CI](https://github.com/Eljoy/ts-jackson/actions/workflows/ci.yml/badge.svg)](https://github.com/Eljoy/ts-jackson/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/ts-jackson)](https://www.npmjs.com/package/ts-jackson)
[![license](https://img.shields.io/npm/l/ts-jackson)](./LICENSE)

Map ugly API JSON into clean TypeScript classes — and back. Inspired by Java's Jackson, built for the shape of real-world APIs.

```typescript
import { JsonProperty, Serializable, deserialize, serialize } from 'ts-jackson'

const response = {
  track: {
    id: '42',
    album: { images: [{ url: 'https://cover.jpg' }] },
    duration_ms: 235000,
  },
}

@Serializable()
class Track {
  @JsonProperty('track.id')
  id: string

  @JsonProperty('track.album.images[0].url')
  coverUrl: string

  @JsonProperty('track.duration_ms')
  durationMs: number
}

const track = deserialize(response, Track)
// Track { id: '42', coverUrl: 'https://cover.jpg', durationMs: 235000 }

serialize(track)
// restores the original nested shape
```

## Why ts-jackson

- **Deep path mapping** — properties resolve through [lodash path patterns](https://lodash.com/docs/#get) (`'track.album.images[0].url'`), so a flat domain class can be built from arbitrarily nested JSON and serialized back to the same shape. Flat-rename-only mappers can't restructure.
- **Works with both decorator standards** — legacy `experimentalDecorators` *and* TC39 standard decorators (the TypeScript 5+ default). That includes toolchains without `emitDecoratorMetadata` support such as esbuild and Vite.
- **Safe, zod-style parsing** — `safeDeserialize` returns `{ success, data | errors }` and collects *every* property error in one pass instead of throwing on the first.
- **Typed, structured errors** — every error carries a `kind` discriminant plus fields like `propertyName`, `path`, `expected`, and the offending `value`.
- **Strict mode, polymorphism, Maps/dictionaries, naming strategies, access control** — see the tour below.

## Installation

```bash
npm install ts-jackson reflect-metadata
```

`reflect-metadata` is a peer dependency; the library imports it internally, so no extra setup is needed in your code.

### TypeScript configuration

**Legacy decorators** (full feature set including type inference):

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

**Standard (TC39) decorators** — no flags at all. Types cannot be inferred (the standard has no `emitDecoratorMetadata` equivalent), so pass them explicitly where conversion matters:

```typescript
@Serializable()
class Event {
  @JsonProperty({ type: Date })
  startsAt: Date

  @JsonProperty({ elementType: Image }) // elementType implies an array
  images: Image[]

  @JsonProperty({ type: Map, elementType: Image })
  imagesBySize: Map<string, Image>
}
```

Everything else — paths, hooks, `strict`, `required`, polymorphism — behaves identically in both modes.

## API tour

### Entry points

```typescript
deserialize(json, Track)                 // throws on the first error
serialize(track)

deserializeArray(jsonArray, Track)       // top-level JSON arrays
serializeArray(tracks)

safeDeserialize(json, Track)             // never throws, collects all errors
safeSerialize(track)
safeDeserializeArray(jsonArray, Track)
```

`deserialize` forwards extra arguments to the constructor:

```typescript
@Serializable()
class Cat {
  @JsonProperty() name: string
  constructor(readonly owner: string) {}
}

deserialize({ name: 'Moon' }, Cat, 'Ilias')
```

### `@JsonProperty`

Accepts a path string, an array of paths, or an options object:

| Option | Purpose |
| --- | --- |
| `path` | JSON path (lodash syntax); defaults to the property name |
| `paths` | Multiple paths resolved into a tuple/array |
| `pathAlternatives` | Deserialize-only aliases; first non-null wins, primary `path` is tried first |
| `required` | Throw `RequiredPropertyError` when the value is missing |
| `default` | Substitute for missing values (checked before `required`, so the two combine) |
| `strict` | Reject JSON values whose type doesn't match — see [Strict mode](#strict-mode) |
| `access` | `'deserialize-only'` (skip on serialize) or `'serialize-only'` (skip on deserialize) |
| `type` | Explicit type; accepts a class or a lazy arrow thunk `() => Class` |
| `elementType` | Element type for `Array`/`Set`/`Map`/dictionary values; thunk allowed |
| `resolveType` | `(json) => Class` — per-value polymorphic dispatch |
| `validate` | Predicate; failure throws `ValidatePropertyError` |
| `beforeDeserialize` / `deserialize` / `afterDeserialize` | Deserialization hooks |
| `beforeSerialize` / `serialize` / `afterSerialize` | Serialization hooks |

Deserialization pipeline order: resolve value → `default` → `required` → `beforeDeserialize` → `strict` → `deserialize` (custom or built-in) → `validate` → assign; `afterDeserialize` hooks run after the whole instance is populated.

### `@Serializable`

```typescript
import { camelToSnakeCase } from 'ts-jackson'

@Serializable({
  formatPropertyName: camelToSnakeCase, // accessToken ⇆ access_token
  strict: true,                         // strict for every property
})
class Token {
  @JsonProperty() accessToken: string   // maps to 'access_token'
  @JsonProperty('expires') expiresIn: number // explicit path wins
  @JsonProperty({ strict: false }) raw: unknown // per-property opt-out
}
```

Both options are inherited by subclasses and can be overridden. Bundled naming strategies: `camelToSnakeCase`, `camelToKebabCase`, `camelToPascalCase` — or pass any `(name: string) => string`.

### Path resolution

```typescript
// Single deep path
@JsonProperty('track.album.images[0].url')
coverUrl: string

// Multiple paths → tuple
@JsonProperty({ paths: ['id', 'meta.rev'] })
idAndRevision: [string, number]

// Aliases: first non-null of snack → treat → goodie
@JsonProperty({ pathAlternatives: ['treat', 'goodie'] })
snack: string
```

Serialization always writes to the primary path, so `deserialize(serialize(x))` is stable.

### Collections

`Array`, `Set`, `Map`, and plain-object dictionaries are supported; `elementType` types their values:

```typescript
@Serializable()
class Gallery {
  @JsonProperty({ elementType: Image })
  images: Image[]

  @JsonProperty({ elementType: Image })
  imagesBySize: Map<string, Image>        // { small: {...} } → Map

  @JsonProperty({ elementType: Image })
  imagesByName: Record<string, Image>     // values become Image instances
}
```

### Polymorphism

`resolveType` picks the concrete class per value:

```typescript
@Serializable()
class Canvas {
  @JsonProperty({
    elementType: Shape,
    resolveType: (json) => ('radius' in json ? Circle : Square),
  })
  shapes: Shape[]
}
```

Serialization dispatches on each value's runtime class automatically.

### Self-referencing and circular types

Use arrow-function thunks when a class references itself or when model files import each other circularly:

```typescript
@Serializable()
class Category {
  @JsonProperty() name: string

  @JsonProperty({ elementType: () => Category })
  children: Category[]
}
```

### Strict mode

By default, primitives are coerced (`Number('42') → 42`, `Number('abc') → NaN`). With `strict` — per property or class-wide — the raw JSON value must already match the declared type:

```typescript
@JsonProperty({ strict: true })
age: number

deserialize({ age: '30' }, Person)
// TypeMismatchError: Property 'age' (path: 'age') in Person failed type
// check: expected Number, received string ("30").
```

`null` and missing values pass strict checks (use `required` for presence); a custom `deserialize` function bypasses them.

### Error handling

All library errors extend `TsJacksonError` and expose structured fields:

| Class | `kind` | Fields |
| --- | --- | --- |
| `RequiredPropertyError` | `'required'` | `propertyName`, `path`, `className` |
| `TypeMismatchError` | `'type-mismatch'` | `propertyName`, `path`, `className`, `expected`, `value` |
| `ValidatePropertyError` | `'validation'` | `propertyName`, `className`, `value` |
| `SerializableError` | `'not-serializable'` | `className` |

Throwing style:

```typescript
try {
  deserialize(json, Track)
} catch (error) {
  if (error instanceof TypeMismatchError) {
    console.log(error.propertyName, error.expected, error.value)
  }
}
```

Functional style — collects every error in one pass:

```typescript
import { safeDeserialize, isTsJacksonError } from 'ts-jackson'

const result = safeDeserialize(json, Track)
if (!result.success) {
  for (const error of result.errors.filter(isTsJacksonError)) {
    switch (error.kind) {
      case 'required':      // error.path
      case 'type-mismatch': // error.expected, error.value
      case 'validation':    // error.value
    }
  }
}
```

### `SerializableEntity`

Base class bundling the API and removing the need for `@Serializable`:

```typescript
class Image extends SerializableEntity {
  @JsonProperty({ required: true })
  url: string
}

const image = Image.deserialize({ url: '...' })
image.serialize()
image.stringify()
```

## Migrating from v1

- **Node/TS baseline**: compiled output targets ES2017; TypeScript peer tooling expects modern versions.
- **`reflect-metadata` is now a peer dependency** — installed alongside the lib (npm 7+ does this automatically); the library still imports it for you.
- **Errors**: collection shape mismatches now throw `TypeMismatchError` (previously a bare `TypeError`); all errors expose structured fields and `kind`.
- **Packaging**: an `exports` map now defines the public entry point — deep imports from `dist/` internals are no longer part of the API. Plain Node ESM (`import ... from 'ts-jackson'`) now works.
- Everything decorated for v1 keeps deserializing identically; subclass metadata no longer leaks into parent classes (previously a bug).

## Examples

See [`src/examples`](./src/examples) for real-world models (Spotify API entities, OAuth tokens) used as living documentation and tests.

## License

[MIT](./LICENSE)
