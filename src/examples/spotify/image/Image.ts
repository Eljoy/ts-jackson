import { JsonProperty } from '../../../../index'
import SerializableEntity from '../../../SerializableEntity'

export default class Image extends SerializableEntity {
  @JsonProperty()
  readonly height?: number

  @JsonProperty()
  readonly width?: number

  @JsonProperty({ required: true })
  readonly url: string
}
