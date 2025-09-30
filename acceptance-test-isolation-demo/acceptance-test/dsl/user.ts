import { DslContext } from "../../../acceptance-test/dsl/utils/context"
import { Params, ParamsArgs } from "../../../acceptance-test/dsl/utils/params"
import type { MockDriver } from "../protocol-driver"

export class UserDsl {
    public constructor(
        private readonly context: DslContext,
        private readonly driver: MockDriver
    ) {}

    public createUser(args: ParamsArgs = {}): void {
        const params = new Params(this.context, { name: "User", ...args })
        const username = params.alias("name")

        this.driver.createUser(username)
    }

    public confirmUserExists(args: ParamsArgs = {}): void {
        const params = new Params(this.context, { name: "User", ...args })
        const username = params.alias("name")

        this.driver.confirmUserExists(username)
    }

    public confirmUserHasEmptyTodoList(args: ParamsArgs = {}): void {
        const params = new Params(this.context, { name: "User", ...args })
        const username = params.alias("name")

        this.driver.confirmUserHasEmptyTodoList(username)
    }
}
