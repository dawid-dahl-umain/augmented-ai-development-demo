import { DslContext } from "../../../acceptance-test/dsl/utils/context"
import { MockDriver } from "../protocol-driver"
import { MockTodoSystem } from "../sut"
import { TodoDsl } from "./todo"
import { UserDsl } from "./user"

export class Dsl {
    public readonly user: UserDsl
    public readonly todo: TodoDsl

    constructor() {
        const context = new DslContext()
        const sut = new MockTodoSystem()
        const driver = new MockDriver(sut)

        this.user = new UserDsl(context, driver)
        this.todo = new TodoDsl(context, driver)
    }
}
