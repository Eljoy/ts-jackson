import { deserialize, JsonProperty } from '../../../../index'
import Entity from '../Entity'

export default class Image extends Entity {
  @JsonProperty()
  readonly height?: number

  @JsonProperty()
  readonly width?: number

  @JsonProperty({ required: true })
  readonly url: string

  static deserialize(imageJson: Record<string, unknown>): Image {
    return deserialize(imageJson, Image)
  }
}
