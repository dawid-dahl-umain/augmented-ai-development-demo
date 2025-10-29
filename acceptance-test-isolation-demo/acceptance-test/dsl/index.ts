import { DslContext } from "../../../acceptance-test/dsl/utils/context"
import type { ProtocolDriver } from "../protocol-driver"
import { TodoDsl } from "./todo"
import { UserDsl } from "./user"

export class Dsl {
    public readonly user: UserDsl
    public readonly todo: TodoDsl

    public constructor(driver: ProtocolDriver) {
        const context = new DslContext()

        this.user = new UserDsl(context, driver)
        this.todo = new TodoDsl(context, driver)
    }
}
