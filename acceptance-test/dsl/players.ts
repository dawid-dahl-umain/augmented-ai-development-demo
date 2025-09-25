import { DslContext } from "./utils/context"

export class PlayersDsl {
    private readonly context = new DslContext()

    public reset(): void {
        this.context.reset()
    }
}

export const players = new PlayersDsl()
