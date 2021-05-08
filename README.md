# ts-jackson

A typescript library to deserialize and serialize json into classes. You can use different path pattern
to resolve deeply nested structures. Every path pattern provided by lodash/get|set object is supported.
## Installation

```sh
npm install ts-jackson --save
# or
yarn add ts-jackson
```
For tsconfig.json file set **experimentalDecorators** and **emitDecoratorMetadata** to true to allow
support for the decorators:

```json
{
    "compilerOptions": {
        ...
        "emitDecoratorMetadata": true,
        "experimentalDecorators": true,
        ...
    }
}
```

```typescript
import { JsonProperty, Serializable, deserialize, serialize } from 'typescript-json-serializer';
```

## Api
###Imports: 
```typescript
import { JsonProperty, Serializable, deserialize, serialize } from 'typescript-json-serializer';
```
### Decorators
#### Serializable
To mark your class as serializable wrap your class with Serializable decorator:
```typescript
@Serializable()
class Class {}
```

#### JsonProperty
```typescript
/**
 * JsonProperty params
 *
 * @param {string} path -- path pattern for the property
 * supports every pattern provided by lodash/get|set object
 * @param {boolean} required throws an Error if json is missing required property
 * @param {Function} type Optional. In most cases there is no need to specify
 * type explicitly
 * @param {Function} elementType due to reflect-metadata restriction one should
 * explicitly set elementType property to correctly serialize/deserialize Array
 * or Set values
 * @param {Function} validate function for validating json values. Throws an error
 * if property fails to pass validate check
 * @param {Function} deserialize function for custom deserialization
 * @param {Function} serialize function for custom serialization
 */
type Params<P> = {
  path?: string
  required?: boolean
  type?: new (...params: Array<unknown>) => unknown
  elementType?: new (...params: Array<unknown>) => unknown
  validate?: (property: P) => boolean
  deserialize?: (jsonValue: unknown) => P
  serialize?: (property: P) => unknown
}

@JsonProperty(options: Options | string)
```

####path:
The path property can be set in a few different ways:
```typescript
// By inferring path from the property name:
class Cat {
  @JsonProperty()
  name: string
}

// As a string argument
class Track {
  @JsonProperty('duration_ms')
  durationMs: number
}

// As an Option parameter
class Track {
  @JsonProperty({
    path: 'duration_ms'
  })
  durationMs: number
}

```
Path property supports different formats for resolving deeply nested structures provided by lodash `_.set(object, path, value)

Resolving deeply nested structures:
```typescript
const trackJson = {
  track: {
    id: 'some id',
  },
}

@Serializable()
class Track {
  @JsonProperty('track.id')
  readonly id: string
}

const deserialized = deserialize(trackJson, Track)
// Track { id: 'some id' }

serialize(deserialized)
// { track: { id: 'some id' } }
```

Resolving array structures

``` typescript
const jsonData = {
  images: {
    items: [
      {
        height: 300,
        url:
          'https://i.scdn.co/image/ab67616d0000b27380368f0aa8f90c51674f9dd2',
        width: 300,
      },
      {
        height: 640,
        url:
          'https://i.scdn.co/image/ab67616d00001e0280368f0aa8f90c51674f9dd2',
        width: 640,
      },
    ],
  },
}

@Serializable()
class Playlist {
  @JsonProperty('images.items[1]')
  readonly backgroundImage: Image
}

const deserialized = deserialize(jsonData, Playlist)
// Playlist {
//   backgroundImage: Image {
//     height: 640,
//     width: 640,
//     url: 'https://i.scdn.co/image/ab67616d00001e0280368f0aa8f90c51674f9dd2'
//   }
// }
const serialized = serialize(deserialized)
// {
//   images: {
//     items: [undefined, {
//       height: 640,
//       width: 640,
//       url: 'https://i.scdn.co/image/ab67616d00001e0280368f0aa8f90c51674f9dd2',
//     }],
//   },
// }

```
For more patterns for resolving structures check out [lodash/get](https://lodash.com/docs/#get) docs.

### Functions
#### deserialize
```typescript
/**
 * Function to deserialize json to Serializable class
 *
 * @param {Record<string, unknown>} json
 * @param serializableClass Class to which json should be serialized
 * @param args an arguments to be provided to constructor.
 * For example Cat(readonly name, readonly color)
 * deserialize({}, Cat, 'Moon', 'black')
 */
export default function deserialize<T, U extends Array<unknown>>(
  json: Record<string, unknown>,
  serializableClass: new (...params: [...U]) => T,
  ...args: U
): T { }
```
#### serialize

```typescript
/**
 * Function to serialize Serializable class to json
 *
 * @param {Function} instance serializable instance
 * @returns {Record<string, unknown>} json
 */
export default function serialize<
  T extends new (...args: unknown[]) => unknown
>(instance: InstanceType<T>): Record<string, unknown> {
```
#### Examples

```typescript
const trackJson = {
  track: {
    id: 'some id',
  },
}

@Serializable()
class Track {
  @JsonProperty('track.id')
  readonly id: string
}

const deserializedClassIntance = deserialize(trackJson, Track)
const serializedJson = serialize(deserializedClassIntance)
```
#### Using constructor arguments:
```typescript
// using constructor params:
@Serializable()
class Image {
  @JsonProperty({ required: true })
  readonly url: string

  constructor(readonly width: number, readonly height: number) {
  }
}
deserialize({url: 'url'}, Image, 5, 3)
const deserializedClassIntance = deserialize({url: 'some url'}, Image, 5, 4)
const serializedJson = serialize(deserializedClassIntance)
```



