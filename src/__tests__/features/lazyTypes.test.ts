import {
  deserialize,
  JsonProperty,
  Serializable,
  serialize,
} from '../../../index'

describe('Lazy type references', () => {
  test('self-referencing class via elementType thunk', () => {
    @Serializable()
    class Category {
      @JsonProperty()
      name: string

      @JsonProperty({ elementType: () => Category })
      children: Category[]
    }

    const json = {
      name: 'root',
      children: [
        { name: 'child', children: [{ name: 'grandchild', children: [] }] },
      ],
    }

    const root = deserialize(json, Category)
    expect(root.children[0]).toBeInstanceOf(Category)
    expect(root.children[0].children[0]).toBeInstanceOf(Category)
    expect(root.children[0].children[0].name).toBe('grandchild')
    expect(serialize(root)).toStrictEqual(json)
  })

  test('type thunk for a single nested property', () => {
    @Serializable()
    class Node {
      @JsonProperty()
      value: number

      @JsonProperty({ type: () => Node })
      next: Node | null = null
    }

    const json = { value: 1, next: { value: 2, next: null } }
    const head = deserialize(json, Node)
    expect(head.next).toBeInstanceOf(Node)
    expect(head.next.value).toBe(2)
    expect(serialize(head)).toStrictEqual(json)
  })

  test('thunk types work with strict checks', () => {
    @Serializable()
    class Leaf {
      @JsonProperty()
      id: string
    }

    @Serializable()
    class Tree {
      @JsonProperty({ type: () => Leaf, strict: true })
      leaf: Leaf
    }

    expect(() => deserialize({ leaf: 'oops' }, Tree)).toThrow(
      /leaf.*expected Leaf.*received string/
    )
    expect(deserialize({ leaf: { id: 'a' } }, Tree).leaf).toBeInstanceOf(Leaf)
  })

  test('non-thunk class types keep working unchanged', () => {
    @Serializable()
    class Image {
      @JsonProperty()
      url: string
    }

    @Serializable()
    class Playlist {
      @JsonProperty({ type: Image })
      cover: Image
    }

    expect(
      deserialize({ cover: { url: 'coverUrl' } }, Playlist).cover
    ).toBeInstanceOf(Image)
  })
})
