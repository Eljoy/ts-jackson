import JsonProperty from './JsonProperty'
import SerializableEntity from './SerializableEntity'

describe('SerializableEntity', () => {
  test('serialize/deserialize inheritance', () => {
    class Cat extends SerializableEntity {
      @JsonProperty()
      name: string
    }
    const json = {
      name: 'Mars',
    }
    const deserializedCat = Cat.deserialize(json)
    expect(deserializedCat).toBeInstanceOf(Cat)
    expect(deserializedCat.name).toEqual(json.name)

    const serializedCat = deserializedCat.serialize()
    expect(serializedCat).toEqual(json)
  })

  test('serialize/deserialize with params', () => {
    class Cat extends SerializableEntity {
      @JsonProperty()
      name: string
      constructor(readonly color: string) {
        super()
      }
    }
    const json = {
      name: 'Mars',
    }
    const deserializedCat = Cat.deserialize(json, 'black')
    expect(deserializedCat).toEqual({
      name: json.name,
      color: 'black',
    })
  })
})
