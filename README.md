# ts-jackson

A typescript library to deserialize and serialize json into classes and vice versa. You can use different path pattern
to resolve deeply nested structures. Every path pattern provided by `lodash.set` function is supported.
Check out [src/examples](https://github.com/Eljoy/ts-jackson/tree/main/src/examples/spotify) as a reference.

* [Installation](#installation)
* [Imports](#imports)
* [Serializable](#serializable)
* [JsonProperty](#jsonproperty)
  * [Options](#jsonproperty)
  * [Path](#path)
  * [Multiple paths](#multiple-paths)
* [Deserialize](#deserialize)
* [Serialize](#serialize)
* [Using constructor arguments](#deserialize)
* [SerializableEntity](#serializableentity)

    
### Installation:

```sh
npm install ts-jackson --save
# or
yarn add ts-jackson
```
For `tsconfig.json` file set `experimentalDecorators` and `emitDecoratorMetadata` to `true` to allow
decorators support:

```json
{
    "compilerOptions": {
        "emitDecoratorMetadata": true,
        "experimentalDecorators": true
    }
}
```
### Api:
### Imports: 
```typescript
import { JsonProperty, Serializable, deserialize, serialize, SerializableEntity } from 'typescript-json-serializer';
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
 * @param {Function | Function[]} type Optional. In most cases there is no need to specify
 * type explicitly. You can also provide array of type constructors for tuple support.
 * @param {Function} elementType due to reflect-metadata restriction one should
 * explicitly set elementType property to correctly serialize/deserialize Array
 * or Set values
 * @param {Function} validate function for validating json values. Throws an error
 * if property fails to pass validate check
 * @param {Function} deserialize function for custom deserialization
 * @param {Function} serialize function for custom serialization
 * @param {Function} afterDeserialize takes deserialized instance and deserialized property. Should return new property value.
 */
declare type Params<P> = {
  path?: string
  paths?: string[]
  required?: boolean
  type?:
          | (new (...args: any[]) => P)
          | {
    [K in keyof P]: new (...args: any[]) => P[K]
  }
  elementType?: new (...args: any[]) => P extends [] ? P[0] : any
  validate?: (property: P) => boolean
  deserialize?: (jsonValue: any) => P
  serialize?: (property: P) => any
  afterDeserialize?: (
          deserializedInstance: InstanceType<new (...args: any[]) => any>,
          propertyValue: any
  ) => P
  beforeSerialize?: (propertyValue: P) => any
  afterSerialize?: (serializedData: any) => any
}

/**
 * Decorator. Collects annotated property metadata.
 * Takes as a param either a single string param (path),
 * Array of strings (multiple paths), or param object.
 * @param {string | |string[] | Params } arg
 */
export default function JsonProperty<P = unknown>(
        arg?: Params<P> | string | string[]
): (object: Object, propertyName: string) => void
```

#### Path:
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
Path property supports different formats for resolving deeply nested structures provided by `lodash` `_.set(object, path, value)`

#### Multiple paths
You can resolve property as a combination of multiple json paths, provided either as `Params` property or 
as an argument to `@JsonProperty` decorator:
```typescript
const json = {
  images: {
    smallImage: {
      url: 'mediumImageUrl',
    },
    mediumImage: {
      url: 'mediumImageUrl',
    },
    bigImage: {
      url: 'bigImageUrl',
    },
  },
}

@Serializable()
class Playlist {
  @JsonProperty({
    paths: ['images.smallImage', 'images.mediumImage', 'images.bigImage'],
    elementType: Image,
  })
  images: Image[]
}
```
You can also provide custom deserialize, beforeSerialize functions:
```typescript
const json = {
  images: [
    {
      url: 'mediumImageUrl',
    },
    {
      url: 'mediumImageUrl',
    },
    {
      url: 'bigImageUrl',
    },
  ],
}

@Serializable()
class Playlist {
  @JsonProperty({
    paths: ['images[0]', 'images[2]'],
    elementType: Image,
    deserialize: ([icon, cover]: Image[]) => ({ icon, cover }),
    beforeSerialize: (images) => [images.icon, images.cover],
  })
  images: {
    icon: Image
    cover: Image
  }
}
```

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

#### deserialize
```typescript
/**
 * Function to deserialize json to Serializable class
 *
 * @param {Record<string, unknown> | string} json
 * @param serializableClass Class to which json should be serialized
 * @param args an arguments to be provided to constructor.
 * For example Cat(readonly name, readonly color)
 * deserialize({}, Cat, 'Moon', 'black')
 */
export default function deserialize<T, U extends Array<unknown>>(
  json: Record<string, unknown> | string,
  serializableClass: new (...args: [...U]) => T,
  ...args: U
): T
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

#### SerializableEntity
```typescript
/**
 * @class
 * Utility class that encapsulates deserialize, serialize
 * and the need for @Serializable explicit decoration.
 */
export default class SerializableEntity {
  /**
   * @method Returns stringified results
   * of serialize method call
   */
  stringify(): string
  serialize(): Record<string, unknown>
  static deserialize<T, U extends Array<unknown>>(
          this: {
            new (...params: [...U]): T
          },
          json: Record<string, unknown>,
          ...args: U
  ): T
}
// Example:
class Image extends SerializableEntity {
  @JsonProperty()
  readonly height?: number

  @JsonProperty()
  readonly width?: number

  @JsonProperty({ required: true })
  readonly url: string
}


const imageJson = {
  height: '234',
  width: '123',
  url: 'http://localhost:8080',
}
const image = Image.deserialize(imageJson)
// Image { height: 234, width: 123, url: 'http://localhost:8080' }

image.serialize()
// { height: 234, width: 123, url: 'http://localhost:8080' }

image.stringify()
// '{"height":234,"width":123,"url":"http://localhost:8080"}'

```



