# Reflection mechanisms for ts-jackson: evaluation (July 2026)

ts-jackson currently relies on TypeScript **legacy decorators**
(`experimentalDecorators`) plus **`emitDecoratorMetadata`**, with the
`reflect-metadata` polyfill as the runtime store. Two features depend on this:

1. **Metadata storage** — `Reflect.defineMetadata`/`getMetadata` keyed on the
   class constructor (used by `JsonProperty`, `Serializable`, `serialize`,
   `deserialize`).
2. **Type inference** — reading the compiler-emitted `design:type` so that
   `@JsonProperty()` can infer `Date`, `Number`, `Image`, etc. from the TS
   property annotation with zero configuration. This is the library's main
   ergonomic selling point.

## Options considered

### 1. Status quo: legacy decorators + reflect-metadata

- Still fully supported by TypeScript 6 (this repo now builds on it) and used
  by the large decorator ecosystems (NestJS, TypeORM, Angular-adjacent code).
- Costs: ~50 kB polyfill dependency, mutates the global `Reflect`, and the
  mechanism is permanently non-standard — `emitDecoratorMetadata` has no
  equivalent in the TC39 standard and will never migrate on its own.

### 2. Lighter polyfill (e.g. `@abraham/reflection`)

- Drop-in replacement (~3 kB) for the subset ts-jackson uses
  (`defineMetadata`, `getMetadata`, `getOwnMetadata`); `design:type` emission
  is compiler-side and unaffected.
- Low effort, real install-size win, but does not address the standardization
  question, and mixing polyfills can conflict in apps that already load
  `reflect-metadata` transitively (NestJS/TypeORM apps — a large share of
  likely consumers).

### 3. TC39 standard decorators + decorator metadata (`Symbol.metadata`)

Status: decorators and decorator metadata are **Stage 3**; the spec text is
complete but no browser/Node ships them natively yet, so everyone still
transpiles. TypeScript ≥5.2 implements both in standard mode (no
`experimentalDecorators` flag).

What we would gain:

- **The inheritance model we just fixed by hand comes for free**: each class's
  `context.metadata` object is prototype-linked to the superclass's metadata,
  so subclasses inherit and shadow parent metadata without any copy-on-write
  logic (the exact bug fixed in `JsonProperty.ts` on this branch).
- No global `Reflect` mutation; the only shim needed is
  `Symbol.metadata ??= Symbol.for('Symbol.metadata')`.
- Alignment with where the ecosystem is heading; legacy mode is a
  compatibility flag with a finite lifetime (the native TS 7 compiler already
  deprecates other legacy switches).

What we would lose:

- **`design:type` does not exist for standard decorators.** There is no
  `emitDecoratorMetadata` equivalent, so `@JsonProperty()` could no longer
  infer property types. Every typed property would need explicit config
  (`@JsonProperty({ type: Date })`), which is a real API regression for the
  primary use case.

### 4. Compile-time type extraction (typia / ts-patch transformer style)

Full type fidelity and zero runtime reflection, but it is an architectural
rewrite and forces a compiler plugin on every consumer. Out of scope for v2;
it would effectively be a different library.

## Recommendation

- **v2.0 (this branch): stay on legacy decorators + reflect-metadata.** The
  toolchain upgrade confirms TS 6 supports it, and it preserves the
  zero-config type inference that differentiates the library.
- **v2.x: add dual-mode decorators.** A decorator can detect at runtime which
  protocol invoked it (legacy field decorators receive
  `(prototype, propertyName)`; standard ones receive `(value, context)` where
  `context.kind === 'field'`). In standard mode, store metadata on
  `context.metadata` and require an explicit `type` where inference is
  impossible. This lets consumers on standard-mode TypeScript adopt ts-jackson
  without the legacy flags, without breaking existing users.
- **Revisit when decorators reach Stage 4 / ship natively.** That is the point
  where staying legacy-only would start costing adoption.

Sources: [tc39/proposal-decorators](https://github.com/tc39/proposal-decorators),
[tc39/proposal-decorator-metadata](https://github.com/tc39/proposal-decorator-metadata),
[Towards stage 4 (tc39/proposal-decorators#512)](https://github.com/tc39/proposal-decorators/issues/512),
[caniuse: decorators](https://caniuse.com/decorators),
[TypeScript decorators handbook](https://www.typescriptlang.org/docs/handbook/decorators.html).
