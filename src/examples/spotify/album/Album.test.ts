import { serialize } from '../../../../index'
import Artist from '../artist/Artist'
import Image from '../image/Image'
import Album from './Album'

const testAlbumJson = {
  album_type: 'album',
  artists: [
    {
      external_urls: {
        spotify: 'https://open.spotify.com/artist/23fqKkggKUBHNkbKtXEls4',
      },
      href: 'https://api.spotify.com/v1/artists/23fqKkggKUBHNkbKtXEls4',
      id: '23fqKkggKUBHNkbKtXEls4',
      name: 'Kygo',
      type: 'artist',
      uri: 'spotify:artist:23fqKkggKUBHNkbKtXEls4',
    },
  ],
  available_markets: ['AD', 'AE', 'AG'],
  external_urls: {
    spotify: 'https://open.spotify.com/album/7tcs1X9pzFvcLOPuhCstQJ',
  },
  href: 'https://api.spotify.com/v1/albums/7tcs1X9pzFvcLOPuhCstQJ',
  id: '7tcs1X9pzFvcLOPuhCstQJ',
  images: [
    {
      height: 640,
      url: 'https://i.scdn.co/image/ab67616d0000b27380368f0aa8f90c51674f9dd2',
      width: 640,
    },
    {
      height: 300,
      url: 'https://i.scdn.co/image/ab67616d00001e0280368f0aa8f90c51674f9dd2',
      width: 300,
    },
    {
      height: 64,
      url: 'https://i.scdn.co/image/ab67616d0000485180368f0aa8f90c51674f9dd2',
      width: 64,
    },
  ],
  name: 'Golden Hour',
  release_date: '2020-05-29',
  release_date_precision: 'day',
  total_tracks: 18,
  type: 'album',
  uri: 'spotify:album:7tcs1X9pzFvcLOPuhCstQJ',
}

describe('Album Entity', () => {
  it('should throw Error if provided data for serialization if incorrect', () => {
    expect(() => Album.deserialize({})).toThrow()
  })

  test('deserialize', () => {
    const album = Album.deserialize(testAlbumJson)
    expect(album).toMatchObject({
      id: testAlbumJson.id,
      name: testAlbumJson.name,
      totalTracks: testAlbumJson.total_tracks,
      releaseDate: testAlbumJson.release_date,
      artists: testAlbumJson.artists.map((a) => Artist.deserialize(a)),
      backgroundImage: Image.deserialize(testAlbumJson.images[0]),
      icon: Image.deserialize(testAlbumJson.images[2]),
      href: testAlbumJson.href,
    })
    expect(album instanceof Album).toBeTruthy()
    expect(album.backgroundImage instanceof Image).toBeTruthy()
    expect(album.icon instanceof Image).toBeTruthy()
  })

  test('serialize', () => {
    const album = Album.deserialize(testAlbumJson)
    expect(serialize(album)).toEqual({
      id: album.id,
      name: album.name,
      total_tracks: album.totalTracks,
      release_date: testAlbumJson.release_date,
      artists: testAlbumJson.artists,
      images: [
        serialize(album.backgroundImage),
        undefined,
        serialize(album.icon),
      ],
      href: album.href,
    } as Partial<typeof testAlbumJson>)
  })
})
