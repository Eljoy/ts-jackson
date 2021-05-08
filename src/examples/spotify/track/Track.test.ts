import { serialize } from '../../../../index'
import { Album } from '../album'
import Track from './Track'

const testTrackJson = {
  added_at: '2021-03-12T06:17:44Z',
  added_by: {
    external_urls: {
      spotify: 'https://open.spotify.com/user/',
    },
    href: 'https://api.spotify.com/v1/users/',
    id: '',
    type: 'user',
    uri: 'spotify:user:',
  },
  is_local: false,
  primary_color: null,
  track: {
    album: {
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
          url:
            'https://i.scdn.co/image/ab67616d0000b27380368f0aa8f90c51674f9dd2',
          width: 640,
        },
        {
          height: 300,
          url:
            'https://i.scdn.co/image/ab67616d00001e0280368f0aa8f90c51674f9dd2',
          width: 300,
        },
        {
          height: 64,
          url:
            'https://i.scdn.co/image/ab67616d0000485180368f0aa8f90c51674f9dd2',
          width: 64,
        },
      ],
      name: 'Golden Hour',
      release_date: '2020-05-29',
      release_date_precision: 'day',
      total_tracks: 18,
      type: 'album',
      uri: 'spotify:album:7tcs1X9pzFvcLOPuhCstQJ',
    },
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
      {
        external_urls: {
          spotify: 'https://open.spotify.com/artist/5Pwc4xIPtQLFEnJriah9YJ',
        },
        href: 'https://api.spotify.com/v1/artists/5Pwc4xIPtQLFEnJriah9YJ',
        id: '5Pwc4xIPtQLFEnJriah9YJ',
        name: 'OneRepublic',
        type: 'artist',
        uri: 'spotify:artist:5Pwc4xIPtQLFEnJriah9YJ',
      },
    ],
    available_markets: ['AD', 'AE', 'AG', 'ZW'],
    disc_number: 1,
    duration_ms: 199549,
    episode: false,
    explicit: false,
    external_ids: {
      isrc: 'SEBGA2000398',
    },
    external_urls: {
      spotify: 'https://open.spotify.com/track/1sgDyuLooyvEML4oHspNza',
    },
    href: 'https://api.spotify.com/v1/tracks/1sgDyuLooyvEML4oHspNza',
    id: '1sgDyuLooyvEML4oHspNza',
    is_local: false,
    name: 'Lose Somebody',
    popularity: 74,
    preview_url:
      'https://p.scdn.co/mp3-preview/c424249e27d2bc82982e8b0ce3fc1d0d63cdaf83?cid=06006394f03e41b9af557e5e00ab2220',
    track: true,
    track_number: 2,
    type: 'track',
    uri: 'spotify:track:1sgDyuLooyvEML4oHspNza',
  },
  video_thumbnail: {
    url: null,
  },
}

describe('Track Entity', () => {
  it('should throw Error if provided data for serialization if incorrect', () => {
    expect(() => Track.deserialize({})).toThrow()
  })

  test('deserialize', () => {
    const track = Track.deserialize(testTrackJson)
    expect(track).toMatchObject({
      id: testTrackJson.track.id,
      href: testTrackJson.track.href,
      name: testTrackJson.track.name,
      album: Album.deserialize(testTrackJson.track.album),
      durationMs: testTrackJson.track.duration_ms,
      previewUrl: testTrackJson.track.preview_url,
    })
    expect(track instanceof Track).toBeTruthy()
    expect(track.album instanceof Album).toBeTruthy()
  })

  test('serialize', () => {
    const track = Track.deserialize(testTrackJson)
    expect(serialize(track)).toEqual({
      track: {
        id: track.id,
        href: track.href,
        artists: track.artists as unknown[],
        name: track.name,
        album: serialize(track.album),
        duration_ms: track.durationMs,
        preview_url: track.previewUrl,
      },
    } as Partial<typeof testTrackJson>)
  })
})
