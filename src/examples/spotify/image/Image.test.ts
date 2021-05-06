import Image from './Image'

describe('Image Entity', () => {
  it('should throw Error if provided data for serialization if incorrect', () => {
    expect(() => Image.deserialize({})).toThrow()
  })

  it('should correctly deserialize to Image when proper data is provided', () => {
    const imageData = {
      height: '234',
      width: '123',
      url: 'http://localhost:8080',
    }
    const image = Image.deserialize(imageData)
    expect(image).toMatchObject({
      height: parseInt(imageData.height),
      width: parseInt(imageData.width),
      url: imageData.url,
    })
  })

  it('should omit unrequired field if those are not provided', () => {
    const imageData = {
      url: 'http://localhost:8080',
    }
    const image = Image.deserialize(imageData)
    expect(image).toMatchObject({
      url: imageData.url,
    })
  })
})
