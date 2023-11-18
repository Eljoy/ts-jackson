# ts-jackson

`ts-jackson` is a powerful TypeScript library designed for efficient JSON serialization and deserialization into classes. It leverages lodash's path patterns to effortlessly resolve deeply nested structures. Explore the `src/examples` directory for practical illustrations of its capabilities.

## 🚀 Installation

Easily integrate `ts-jackson` into your project using npm or yarn:

```bash
npm install ts-jackson --save
# or
yarn add ts-jackson
```

## TypeScript Configuration
Ensure your TypeScript environment is configured to use decorators:

```json
{
  "compilerOptions": {
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true
  }
}
```

## 🎯 Goals
- Minimalistic API.
- Support for serializing and deserializing nested structures.
- Support for custom serialization and deserialization.

## 📚 Examples
For practical usage examples, refer to the `src/examples` directory.

## 📝 Usage

### 🔨 Decorators
The library provides two main decorators: `@Serializable` and `@JsonProperty`.
- `@Serializable` marks a class as serializable.
- `@JsonProperty` collects metadata of annotated properties.

### 📍 Path Resolutions
Path resolution is performed using `lodash/set`. Refer to the "Path Resolutions" section for further details.

### 🔄 Serialization and Deserialization
Serialization and deserialization are handled using the provided `deserialize` and `serialize` functions. For more details, see the "Serialization and Deserialization" section.

### 🔗 SerializableEntity
`SerializableEntity` is a utility class that simplifies serialization/deserialization processes and removes the need for explicit `@Serializable` decoration. More information can be found in the "SerializableEntity" section.

## 🔧 API

### Imports
```typescript
import { JsonProperty, Serializable, deserialize, serialize, SerializableEntity } from 'typescript-json-serializer';
```

### Decorators

#### `@Serializable`
Mark a class as serializable:
```typescript
@Serializable()
class MyClass {}
```

#### `@JsonProperty`
This decorator is used for collecting annotated property metadata:
```typescript
// Basic usage
@JsonProperty()
name: string;

// With a path string argument
@JsonProperty('duration_ms')
durationMs: number;

// With options
@JsonProperty({ path: 'duration_ms' })
durationMs: number;
```

For more advanced usage patterns, refer to the full `JsonProperty` decorator API in the original documentation.

### 📍 Path Resolutions
Resolving properties can be done using single paths, multiple paths, or through custom deserialize/serialize functions:
```typescript
// Single path
@JsonProperty('track.id')
readonly id: string;

// Multiple paths
@JsonProperty({
  paths: ["images.smallImage", "images.mediumImage", "images.bigImage"],
  elementType: Image
})
images: Image[]
```

For more patterns on resolving structures, check the lodash/get documentation.

### 🔄 Serialization and Deserialization
Use the provided deserialize and serialize functions:
```typescript
const trackJson = { track: { id: 'some id' } };

@Serializable()
class Track {
  @JsonProperty("track.id")
  readonly id: string;
}

const deserializedClassInstance = deserialize(trackJson, Track);
const serializedJson = serialize(deserializedClassInstance);
```

### 🔗 SerializableEntity
A utility class that encompasses deserialize, serialize, and omits the need for explicit @Serializable decoration:
```typescript
class Image extends SerializableEntity {
  @JsonProperty()
  readonly height?: number;

  @JsonProperty()
  readonly width?: number;

  @JsonProperty({ required: true })
  readonly url: string;
}
```
