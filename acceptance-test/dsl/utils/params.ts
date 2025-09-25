import { DslContext } from "./context"

export class Params {
    public constructor(private readonly context: DslContext) {}

    public alias(name: string): string {
        return this.context.alias(name)
    }

    public sequence(name: string, start = 1): string {
        return this.context.sequence(name, start)
    }
}
