import Image from '../image/Image'
import Track from '../track/Track'
import Playlist from './Playlist'

const testPlaylistJson = {
  id: '37i9dQZF1DXdsy92d7BLpC',
  name: 'Weekend Hangouts',
  description:
    'Throwing a soft party, having drinks or just chilling with your friends.',
  images: [
    {
      height: 640,
      url:
        'https://mosaic.scdn.co/640/e337f3661f68bc4d96a554de0ad7988d65edb25a134cd5ccaef9d411eba33df9542db9ba731aaf98ec04f9acee17a7576f939eb5aa317d20c6322494c4b4399d9b7c6f61b6a6ee70c616bc1a985c7ab8',
      width: 640,
    },
    {
      height: 300,
      url:
        'https://mosaic.scdn.co/300/e337f3661f68bc4d96a554de0ad7988d65edb25a134cd5ccaef9d411eba33df9542db9ba731aaf98ec04f9acee17a7576f939eb5aa317d20c6322494c4b4399d9b7c6f61b6a6ee70c616bc1a985c7ab8',
      width: 300,
    },
    {
      height: 60,
      url:
        'https://mosaic.scdn.co/60/e337f3661f68bc4d96a554de0ad7988d65edb25a134cd5ccaef9d411eba33df9542db9ba731aaf98ec04f9acee17a7576f939eb5aa317d20c6322494c4b4399d9b7c6f61b6a6ee70c616bc1a985c7ab8',
      width: 60,
    },
  ],
  tracks: {
    items: [
      {
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
                  spotify:
                    'https://open.spotify.com/artist/23fqKkggKUBHNkbKtXEls4',
                },
                href:
                  'https://api.spotify.com/v1/artists/23fqKkggKUBHNkbKtXEls4',
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
                spotify:
                  'https://open.spotify.com/artist/23fqKkggKUBHNkbKtXEls4',
              },
              href: 'https://api.spotify.com/v1/artists/23fqKkggKUBHNkbKtXEls4',
              id: '23fqKkggKUBHNkbKtXEls4',
              name: 'Kygo',
              type: 'artist',
              uri: 'spotify:artist:23fqKkggKUBHNkbKtXEls4',
            },
            {
              external_urls: {
                spotify:
                  'https://open.spotify.com/artist/5Pwc4xIPtQLFEnJriah9YJ',
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
      },
    ],
  },
}

describe('Playlist Entity', () => {
  it('should properly deserialize PlaylistDAO', () => {
    const playlist = Playlist.deserialize(testPlaylistJson)
    expect(playlist).toMatchObject({
      id: testPlaylistJson.id,
      name: testPlaylistJson.name,
      description: testPlaylistJson.description,
      icon: Image.deserialize(testPlaylistJson.images[2]),
      backgroundImage: Image.deserialize(testPlaylistJson.images[0]),
      tracks: testPlaylistJson.tracks.items.map((trackJson) =>
        Track.deserialize(trackJson)
      ),
    })
    expect(playlist instanceof Playlist).toBeTruthy()
    expect(playlist.icon instanceof Image).toBeTruthy()
    expect(playlist.backgroundImage instanceof Image).toBeTruthy()
  })
})
