import { deserialize, JsonProperty, Serializable } from '../../../../index'
import Entity from '../../Entity'
import { Artist } from '../artist'
import { Image } from '../image'

@Serializable()
export default class Album extends Entity {
  @JsonProperty({ required: true })
  readonly id: string

  @JsonProperty({ required: true })
  readonly name: string

  @JsonProperty('images[0]')
  readonly backgroundImage: Image

  @JsonProperty('images[2]')
  readonly icon: Image

  @JsonProperty()
  readonly artists: Artist[]

  @JsonProperty('release_date')
  readonly releaseDate: string

  @JsonProperty('total_tracks')
  readonly totalTracks: number

  @JsonProperty()
  readonly href: string

  static deserialize(albumDao: Record<string, unknown>): Album {
    return deserialize(albumDao, Album)
  }
}
