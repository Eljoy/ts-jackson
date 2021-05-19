import { JsonProperty } from '../../../../index'
import SerializableEntity from '../../../SerializableEntity'
import { Image } from '../image'

export default class PlaylistPreview extends SerializableEntity {
  @JsonProperty({ required: true })
  readonly id: string

  @JsonProperty()
  readonly name: string

  @JsonProperty()
  readonly description: string

  @JsonProperty('images[0]')
  readonly backgroundImage: Image

  @JsonProperty()
  readonly href: string

  @JsonProperty({ required: true })
  readonly tracks: {
    href: string
    total: number
  }
}
