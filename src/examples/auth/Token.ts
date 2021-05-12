import { deserialize, JsonProperty } from '../../../index'
import Entity from '../spotify/Entity'
export default class Token extends Entity {
  @JsonProperty({ path: 'access_token', required: true })
  public readonly accessToken: string

  @JsonProperty({ path: 'refresh_token', required: true })
  public readonly refreshToken: string

  @JsonProperty({ path: 'token_type', required: true })
  public readonly tokenType: string

  @JsonProperty({ path: 'expires_in', required: true })
  public readonly expiresIn: number

  @JsonProperty<Date>({
    path: 'expires_in',
    afterDeserialize: (_, propertyValue) => {
      return new Date(Date.now() + propertyValue.getTime())
    },
  })
  expiresAt: Date

  static deserialize(tokenDao: Record<string, unknown>): Token {
    return deserialize(tokenDao, Token)
  }
}
