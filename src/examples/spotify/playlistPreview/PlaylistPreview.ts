import { deserialize, JsonProperty } from '../../../../index'
import Entity from '../../Entity'
import { Image } from '../image'

export default class PlaylistPreview extends Entity {
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

  static deserialize(
    playlistPreviewJson: Record<string, unknown>
  ): PlaylistPreview {
    return deserialize(playlistPreviewJson, PlaylistPreview)
  }
}
