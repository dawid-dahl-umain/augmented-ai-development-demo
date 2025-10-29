import type { TodoStatus } from "../sut"

export interface ProtocolDriver {
    createUser(name: string): void
    confirmUserExists(name: string): void
    confirmUserHasEmptyTodoList(name: string): void
    createTodo(
        id: string,
        title: string,
        description: string,
        owner: string
    ): void
    completeTodo(title: string): void
    confirmTodoExists(title: string): void
    confirmTodoHasOwner(title: string, expectedOwner: string): void
    confirmTodoHasStatus(title: string, expectedStatus: TodoStatus): void
    confirmTodoHasDescription(title: string, expectedDescription: string): void
    confirmUserHasTodoCount(owner: string, expectedCount: number): void
    confirmUserSeesPendingTodo(owner: string, title: string): void
    confirmUserDoesNotSeeTodo(owner: string, title: string): void
}
