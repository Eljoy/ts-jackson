import { JsonProperty } from '../../../../index'
import SerializableEntity from '../../../SerializableEntity'

export default class Artist extends SerializableEntity {
  @JsonProperty()
  readonly id: string

  @JsonProperty()
  readonly name: string

  @JsonProperty()
  readonly href: string
}
