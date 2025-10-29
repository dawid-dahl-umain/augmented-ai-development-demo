import type { ProtocolDriver } from "./interface"
import type { MockTodoSystem, TodoStatus } from "../sut"

export class MockDriver implements ProtocolDriver {
    public constructor(private readonly sut: MockTodoSystem) {}

    public createUser(name: string): void {
        this.sut.createUser(name)
    }

    public confirmUserExists(name: string): void {
        if (!this.sut.userExists(name)) {
            this.fail(`Expected user '${name}' to exist, but it does not`)
        }
    }

    public confirmUserHasEmptyTodoList(name: string): void {
        const todos = this.sut.getUserTodos(name)

        if (todos.length > 0) {
            this.fail(
                `Expected user '${name}' to have empty todo list, but has ${todos.length} todos`
            )
        }
    }

    public createTodo(
        id: string,
        title: string,
        description: string,
        owner: string
    ): void {
        this.sut.createTodo(id, title, description, owner)
    }

    public completeTodo(title: string): void {
        const todo = this.sut.getTodo(title)

        if (!todo) {
            this.fail(`Todo '${title}' does not exist`)
        }

        this.sut.completeTodo(title)
    }

    public confirmTodoExists(title: string): void {
        const todo = this.sut.getTodo(title)

        if (!todo) {
            this.fail(`Expected todo '${title}' to exist, but it does not`)
        }
    }

    public confirmTodoHasOwner(title: string, expectedOwner: string): void {
        const todo = this.sut.getTodo(title)

        if (!todo) {
            this.fail(`Todo '${title}' does not exist`)
        }

        if (todo.owner !== expectedOwner) {
            this.fail(
                `Expected todo '${title}' to belong to '${expectedOwner}', but it belongs to '${todo.owner}'`
            )
        }
    }

    public confirmTodoHasStatus(
        title: string,
        expectedStatus: TodoStatus
    ): void {
        const todo = this.sut.getTodo(title)

        if (!todo) {
            this.fail(`Todo '${title}' does not exist`)
        }

        if (todo.status !== expectedStatus) {
            this.fail(
                `Expected todo '${title}' to have status '${expectedStatus}', but it has status '${todo.status}'`
            )
        }
    }

    public confirmTodoHasDescription(
        title: string,
        expectedDescription: string
    ): void {
        const todo = this.sut.getTodo(title)

        if (!todo) {
            this.fail(`Todo '${title}' does not exist`)
        }

        if (todo.description !== expectedDescription) {
            this.fail(
                `Expected todo '${title}' to have description '${expectedDescription}', but it has '${todo.description}'`
            )
        }
    }

    public confirmUserHasTodoCount(owner: string, expectedCount: number): void {
        const todos = this.sut.getUserTodos(owner)

        if (todos.length !== expectedCount) {
            this.fail(
                `Expected user '${owner}' to have ${expectedCount} todos, but has ${todos.length}`
            )
        }
    }

    public confirmUserSeesPendingTodo(owner: string, title: string): void {
        const pendingTodos = this.sut.getPendingTodos(owner)
        const hasTodo = pendingTodos.some(todo => todo.title === title)

        if (!hasTodo) {
            this.fail(
                `Expected user '${owner}' to see pending todo '${title}', but it is not in their pending list`
            )
        }
    }

    public confirmUserDoesNotSeeTodo(owner: string, title: string): void {
        const todos = this.sut.getUserTodos(owner)
        const hasTodo = todos.some(todo => todo.title === title)

        if (hasTodo) {
            this.fail(
                `Expected user '${owner}' not to see todo '${title}', but it is in their list`
            )
        }
    }

    private fail = (message: string): never => {
        throw new Error(message)
    }
}
