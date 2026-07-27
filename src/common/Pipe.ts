export type PipeStep<Context> = (context: Context) => Context

/**
 * Minimal pipe builder. Steps are registered up front — conditionally
 * via addIf — and executed in registration order on run, each step
 * receiving the context returned by the previous one.
 */
export default class Pipe<Context> {
  private readonly steps: Array<PipeStep<Context>> = []

  add(step: PipeStep<Context>): this {
    this.steps.push(step)
    return this
  }

  addIf(condition: unknown, step: PipeStep<Context>): this {
    return condition ? this.add(step) : this
  }

  run(context: Context): Context {
    return this.steps.reduce((result, step) => step(result), context)
  }
}
