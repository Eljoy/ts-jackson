import { serialize } from '../../../../index'
import Image from './Image'

describe('Image Entity', () => {
  it('should throw Error if provided data for serialization if incorrect', () => {
    expect(() => Image.deserialize({})).toThrow()
  })

  test('deserialize', () => {
    const imageJson = {
      height: '234',
      width: '123',
      url: 'http://localhost:8080',
    }
    const image = Image.deserialize(imageJson)
    expect(image).toMatchObject({
      height: parseInt(imageJson.height),
      width: parseInt(imageJson.width),
      url: imageJson.url,
    })
  })

  test('serialize', () => {
    const imageJson = {
      height: '234',
      width: '123',
      url: 'http://localhost:8080',
    }
    const image = Image.deserialize(imageJson)
    expect(serialize(image)).toEqual({
      height: parseInt(imageJson.height),
      width: parseInt(imageJson.width),
      url: imageJson.url,
    })
  })

  it('should omit unrequited field if those are not provided', () => {
    const imageJson = {
      url: 'http://localhost:8080',
    }
    const image = Image.deserialize(imageJson)
    expect(image).toMatchObject({
      url: imageJson.url,
    })
  })
})
