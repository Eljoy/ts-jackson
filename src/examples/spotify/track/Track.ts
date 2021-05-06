import { deserialize, JsonProperty } from '../../../../index'
import { Album } from '../album'
import { Artist } from '../artist'
import Entity from '../Entity'

export default class Track extends Entity {
  @JsonProperty({ path: 'track.id', required: true })
  readonly id: string

  @JsonProperty({ path: 'track.href', required: true })
  readonly href: string

  @JsonProperty({ path: 'track.name', required: true })
  readonly name: string

  @JsonProperty({ path: 'track.preview_url', required: true })
  readonly previewUrl: string

  @JsonProperty({ path: 'track.album', required: true })
  readonly album: Album

  @JsonProperty({ path: 'track.artists', required: true })
  readonly artists: Artist[]

  @JsonProperty({ path: 'track.duration_ms', required: true })
  readonly durationMs: number

  static deserialize(trackJson: Record<string, unknown>): Track {
    return deserialize(trackJson, Track)
  }
}
