import { DslContext } from "../../../acceptance-test/dsl/utils/context"
import { Params, ParamsArgs } from "../../../acceptance-test/dsl/utils/params"
import type { MockDriver } from "../protocol-driver"

export class TodoDsl {
    public constructor(
        private readonly context: DslContext,
        private readonly driver: MockDriver
    ) {}

    public createTodo(args: ParamsArgs = {}): void {
        const params = new Params(this.context, {
            owner: "User",
            title: "Todo",
            ...args
        })

        const owner = params.alias("owner")
        const title = params.alias("title")
        const description = params.optional("description", "")
        const id = params.optionalSequence("id", 1)

        this.driver.createTodo(id, title, description, owner)
    }

    public confirmTodoExists(args: ParamsArgs = {}): void {
        const params = new Params(this.context, { title: "Todo", ...args })
        const title = params.alias("title")

        this.driver.confirmTodoExists(title)
    }

    public confirmTodoBelongsToUser(args: ParamsArgs = {}): void {
        const params = new Params(this.context, {
            title: "Todo",
            owner: "User",
            ...args
        })
        const title = params.alias("title")
        const owner = params.alias("owner")

        this.driver.confirmTodoHasOwner(title, owner)
    }

    public confirmTodoHasStatus(
        args: ParamsArgs & { status: "pending" | "completed" }
    ): void {
        const params = new Params(this.context, { title: "Todo", ...args })
        const title = params.alias("title")
        const status = params.optional("status", "pending") as
            | "pending"
            | "completed"

        this.driver.confirmTodoHasStatus(title, status)
    }

    public confirmTodoHasDescription(args: ParamsArgs = {}): void {
        const params = new Params(this.context, {
            title: "Todo",
            description: "",
            ...args
        })
        const title = params.alias("title")
        const description = params.optional("description", "")

        this.driver.confirmTodoHasDescription(title, description)
    }

    public completeTodo(args: ParamsArgs = {}): void {
        const params = new Params(this.context, { title: "Todo", ...args })
        const title = params.alias("title")

        this.driver.completeTodo(title)
    }

    public confirmUserHasTodoCount(args: {
        owner?: string
        count: number
    }): void {
        const params = new Params(this.context, {
            owner: args.owner ?? "User"
        })
        const owner = params.alias("owner")

        this.driver.confirmUserHasTodoCount(owner, args.count)
    }

    public confirmUserSeesPendingTodo(args: ParamsArgs = {}): void {
        const params = new Params(this.context, {
            owner: "User",
            title: "Todo",
            ...args
        })
        const owner = params.alias("owner")
        const title = params.alias("title")

        this.driver.confirmUserSeesPendingTodo(owner, title)
    }

    public confirmUserDoesNotSeeTodo(args: ParamsArgs = {}): void {
        const params = new Params(this.context, {
            owner: "User",
            title: "Todo",
            ...args
        })
        const owner = params.alias("owner")
        const title = params.alias("title")

        this.driver.confirmUserDoesNotSeeTodo(owner, title)
    }
}
