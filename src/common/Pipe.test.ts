import Pipe from './Pipe'

describe('Pipe', () => {
  test('runs steps in registration order threading the context', () => {
    const result = new Pipe<string>()
      .add((value) => `${value}a`)
      .add((value) => `${value}b`)
      .add((value) => `${value}c`)
      .run('_')

    expect(result).toBe('_abc')
  })

  test('addIf registers the step only when the condition is truthy', () => {
    const result = new Pipe<number>()
      .addIf(true, (value) => value + 1)
      .addIf(false, (value) => value + 10)
      .addIf(undefined, (value) => value + 100)
      .run(0)

    expect(result).toBe(1)
  })

  test('run with no steps returns the initial context', () => {
    expect(new Pipe<number>().run(42)).toBe(42)
  })

  test('a throwing step aborts the pipe', () => {
    const afterThrow = jest.fn()
    const pipe = new Pipe<number>()
      .add(() => {
        throw new Error('step failed')
      })
      .add(afterThrow)

    expect(() => pipe.run(0)).toThrow('step failed')
    expect(afterThrow).not.toHaveBeenCalled()
  })
})
