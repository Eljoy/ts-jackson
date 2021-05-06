import Image from '../image/Image'
import PlaylistPreview from './PlaylistPreview'

const testPlaylistJson = {
  name: 'Upp och hoppa!',
  collaborative: false,
  description: 'Du kommer studsa ur sängen med den här spellistan.',
  external_urls: {
    spotify:
      'http://open.spotify.com/user/spotify__sverige/playlist/4uOEx4OUrkoGNZoIlWMUbO',
  },
  href:
    'https://api.spotify.com/v1/users/spotify__sverige/playlists/4uOEx4OUrkoGNZoIlWMUbO',
  id: '4uOEx4OUrkoGNZoIlWMUbO',
  tracks: {
    href:
      'https://api.spotify.com/v1/users/spotify__sverige/playlists/4uOEx4OUrkoGNZoIlWMUbO/tracks',
    total: 38,
  },
  images: [
    {
      height: 300,
      url: 'https://i.scdn.co/image/24aa1d1b491dd529b9c03392f350740ed73438d8',
      width: 300,
    },
  ],
}

describe('PlaylistPreview Entity', () => {
  it('should throw Error if provided data for serialization if incorrect', () => {
    expect(() => PlaylistPreview.deserialize({})).toThrow()
  })

  it('should correctly deserialize object', () => {
    const playlistPreview = PlaylistPreview.deserialize(testPlaylistJson)
    expect(playlistPreview).toMatchObject({
      id: testPlaylistJson.id,
      name: testPlaylistJson.name,
      description: testPlaylistJson.description,
      backgroundImage: Image.deserialize(testPlaylistJson.images[0]),
      href: testPlaylistJson.href,
      tracks: {
        href: testPlaylistJson.tracks.href,
        total: testPlaylistJson.tracks.total,
      },
    })
    expect(playlistPreview instanceof PlaylistPreview).toBeTruthy()
    expect(playlistPreview.backgroundImage instanceof Image).toBeTruthy()
  })
})
