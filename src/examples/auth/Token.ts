import { JsonProperty } from '../../../index'
import SerializableEntity from '../../SerializableEntity'

export default class Token extends SerializableEntity {
  @JsonProperty({ path: 'access_token', required: true })
  public readonly accessToken: string

  @JsonProperty({ path: 'refresh_token', required: true })
  public readonly refreshToken: string

  @JsonProperty({ path: 'token_type', required: true })
  public readonly tokenType: string

  @JsonProperty({ path: 'expires_in', required: true })
  public readonly expiresIn: number

  @JsonProperty<Date>({
    path: 'expires_at',
    afterDeserialize: (deserializedInstance: Token) => {
      const expiresAtTimestamp = Date.now() + deserializedInstance.expiresIn
      return new Date(expiresAtTimestamp)
    },
  })
  expiresAt: Date
}
