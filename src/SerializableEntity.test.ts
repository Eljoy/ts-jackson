import JsonProperty from './JsonProperty'
import SerializableEntity from './SerializableEntity'

describe('SerializableEntity', () => {
  describe('serialize/deserialize inheritance', () => {
    class Cat extends SerializableEntity {
      @JsonProperty()
      name: string
    }

    it('should correctly deserialize a JSON object', () => {
      const json = { name: 'Mars' }
      const deserializedCat = Cat.deserialize(json)

      expect(deserializedCat).toBeInstanceOf(Cat)
      expect(deserializedCat.name).toEqual(json.name)
    })

    it('should correctly serialize an object', () => {
      const cat = new Cat()
      cat.name = 'Mars'

      const serializedCat = cat.serialize()
      expect(serializedCat).toEqual({ name: 'Mars' })
    })
  })

  describe('serialize/deserialize with constructor parameters', () => {
    class Cat extends SerializableEntity {
      @JsonProperty()
      name: string

      constructor(readonly color: string) {
        super()
      }
    }

    it('should deserialize with additional constructor params', () => {
      const json = { name: 'Mars' }
      const deserializedCat = Cat.deserialize(json, 'black')

      expect(deserializedCat).toBeInstanceOf(Cat)
      expect(deserializedCat.name).toEqual('Mars')
      expect(deserializedCat.color).toEqual('black')
    })
  })
})
