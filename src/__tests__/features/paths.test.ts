import { serialize } from '../../../index'
import deserialize from '../../deserialize'
import JsonProperty from '../../JsonProperty'
import Serializable from '../../Serializable'

describe('Paths', () => {
  describe('Multiple paths', () => {
    test('Paths deserialized as tuple', () => {
      const json = {
        id: 'idValue',
        bar: {
          foo: 2,
          baz: 'bazName',
        },
      }

      @Serializable()
      class Class {
        @JsonProperty({
          paths: ['id', 'bar.foo'],
        })
        bar: [string, number]
      }

      const expected = new Class()
      expected.bar = [json.id, json.bar.foo]
      const deserialized = deserialize(json, Class)
      console.log(serialize(deserialized))
      expect(deserialized).toStrictEqual(expected)
      expect(serialize(deserialized)).toStrictEqual({
        id: json.id,
        bar: {
          foo: json.bar.foo,
        },
      })
    })

    @Serializable()
    class Image {
      @JsonProperty()
      url: string
    }

    test('Paths deserialized as an array of serializable object', () => {
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

      const playlist = new Playlist()
      playlist.images = Object.values(json.images).map((imageJson) =>
        deserialize(imageJson, Image)
      )
      const deserialized = deserialize(json, Playlist)

      expect(deserialized).toStrictEqual(playlist)
      expect(serialize(deserialized)).toStrictEqual(json)
    })

    test('Deserialize multiple paths into object', () => {
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
      const deserialized = deserialize(json, Playlist)
      expect(deserialized).toStrictEqual(deserialized)
      expect(serialize(deserialized)).toEqual({
        images: [json.images[0], undefined, json.images[2]],
      } as typeof json)
    })
  })
})
