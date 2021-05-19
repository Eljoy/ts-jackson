import { JsonProperty } from '../../../../index'
import SerializableEntity from '../../../SerializableEntity'
import { Image } from '../image'
import { Track } from '../track'

export default class Playlist extends SerializableEntity {
  @JsonProperty({ required: true })
  readonly id: string

  @JsonProperty()
  readonly name: string

  @JsonProperty()
  readonly description: string

  @JsonProperty('images[2]')
  readonly icon?: Image

  @JsonProperty('images[0]')
  readonly backgroundImage: Image

  @JsonProperty({ required: true, path: 'tracks.items', elementType: Track })
  readonly tracks: Track[]
}
