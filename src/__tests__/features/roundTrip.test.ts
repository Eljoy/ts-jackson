import deserialize from '../../deserialize'
import JsonProperty from '../../JsonProperty'
import Serializable from '../../Serializable'
import serialize from '../../serialize'

describe('Round trips and coercion', () => {
  test('Date property round trip', () => {
    @Serializable()
    class Event {
      @JsonProperty()
      startsAt: Date
    }

    const event = new Event()
    event.startsAt = new Date('2026-07-27T12:00:00.000Z')

    const roundTripped = deserialize(serialize(event), Event)
    expect(roundTripped.startsAt).toBeInstanceOf(Date)
    expect(roundTripped.startsAt.getTime()).toBe(event.startsAt.getTime())
  })

  test('Date deserializes from ISO string', () => {
    @Serializable()
    class Event {
      @JsonProperty()
      startsAt: Date
    }

    const deserialized = deserialize(
      { startsAt: '2026-07-27T12:00:00.000Z' },
      Event
    )
    expect(deserialized.startsAt).toBeInstanceOf(Date)
    expect(deserialized.startsAt.toISOString()).toBe('2026-07-27T12:00:00.000Z')
  })

  test('Set of serializable objects round trip', () => {
    @Serializable()
    class Dog {
      @JsonProperty()
      name: string
    }

    @Serializable()
    class Owner {
      @JsonProperty({ elementType: Dog })
      dogs: Set<Dog>
    }

    const scooby = new Dog()
    scooby.name = 'Scooby Doo'

    const owner = new Owner()
    owner.dogs = new Set([scooby])

    const json = serialize(owner)
    expect(json).toStrictEqual({ dogs: [{ name: 'Scooby Doo' }] })
    expect(deserialize(json, Owner)).toStrictEqual(owner)
  })

  describe('Primitive coercion on deserialize', () => {
    @Serializable()
    class Mixed {
      @JsonProperty()
      count: number

      @JsonProperty()
      label: string

      @JsonProperty()
      active: boolean
    }

    test('numeric string coerces to number', () => {
      expect(deserialize({ count: '42' }, Mixed).count).toBe(42)
    })

    test('number coerces to string', () => {
      expect(deserialize({ label: 5 }, Mixed).label).toBe('5')
    })

    test('truthy value coerces to boolean', () => {
      expect(deserialize({ active: 1 }, Mixed).active).toBe(true)
    })

    test('non-numeric string coerces to NaN (documented behavior)', () => {
      expect(deserialize({ count: 'abc' }, Mixed).count).toBeNaN()
    })
  })

  describe('Multiple properties mapped from the same json path', () => {
    @Serializable()
    class Track {
      @JsonProperty('track.id')
      id: string

      @JsonProperty('track.id')
      trackId: string
    }

    test('both properties resolve from the shared path', () => {
      const deserialized = deserialize({ track: { id: 'idValue' } }, Track)
      expect(deserialized.id).toBe('idValue')
      expect(deserialized.trackId).toBe('idValue')
    })
  })
})
