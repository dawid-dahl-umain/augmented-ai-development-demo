import { beforeEach, describe, it } from "vitest"
import { createProtocolDriver } from "../protocol-driver"
import { Dsl } from "../dsl"

let dsl: Dsl

beforeEach(() => {
    const driver = createProtocolDriver()

    dsl = new Dsl(driver)
})

describe("Epic: User Setup", () => {
    describe("Feature: Create user with todo list", () => {
        it("should create user", () => {
            // Given
            // (no user exists with name "Alice" - implicit)

            // When
            dsl.user.createUser({ name: "Alice" })

            // Then
            dsl.user.confirmUserExists({ name: "Alice" })

            // And
            dsl.user.confirmUserHasEmptyTodoList({ name: "Alice" })
        })
    })
})

describe("Epic: Todo Creation", () => {
    describe("Feature: Create todos", () => {
        it("should create todo with title only", () => {
            // Given
            dsl.user.createUser({ name: "Alice" })

            // When
            dsl.todo.createTodo({ owner: "Alice", title: "Buy milk" })

            // Then
            dsl.todo.confirmTodoExists({ title: "Buy milk" })

            // And
            dsl.todo.confirmTodoBelongsToUser({
                title: "Buy milk",
                owner: "Alice"
            })

            // And
            dsl.todo.confirmTodoHasStatus({
                title: "Buy milk",
                status: "pending"
            })

            // And
            dsl.todo.confirmTodoHasDescription({
                title: "Buy milk",
                description: ""
            })
        })

        it("should create todo with title and description", () => {
            // Given
            dsl.user.createUser({ name: "Alice" })

            // When
            dsl.todo.createTodo({
                owner: "Alice",
                title: "Buy milk",
                description: "Get 2% milk"
            })

            // Then
            dsl.todo.confirmTodoHasDescription({
                title: "Buy milk",
                description: "Get 2% milk"
            })

            // And
            dsl.todo.confirmTodoBelongsToUser({
                title: "Buy milk",
                owner: "Alice"
            })
        })

        it("should create multiple todos for same user", () => {
            // Given
            dsl.user.createUser({ name: "Alice" })

            // When
            dsl.todo.createTodo({ owner: "Alice", title: "Buy milk" })

            // And
            dsl.todo.createTodo({ owner: "Alice", title: "Walk dog" })

            // And
            dsl.todo.createTodo({ owner: "Alice", title: "Read book" })

            // Then
            dsl.todo.confirmUserHasTodoCount({ owner: "Alice", count: 3 })
        })
    })
})

describe("Epic: Todo Completion", () => {
    describe("Feature: Complete todos", () => {
        it("should complete a pending todo", () => {
            // Given
            dsl.user.createUser({ name: "Alice" })

            // And
            dsl.todo.createTodo({
                owner: "Alice",
                title: "Buy milk"
            })
            dsl.todo.confirmTodoHasStatus({
                title: "Buy milk",
                status: "pending"
            })

            // When
            dsl.todo.completeTodo({ title: "Buy milk" })

            // Then
            dsl.todo.confirmTodoHasStatus({
                title: "Buy milk",
                status: "completed"
            })
        })

        it("should complete multiple todos", () => {
            // Given
            dsl.user.createUser({ name: "Alice" })

            // And
            dsl.todo.createTodo({ owner: "Alice", title: "Buy milk" })

            // And
            dsl.todo.createTodo({ owner: "Alice", title: "Walk dog" })

            // When
            dsl.todo.completeTodo({ title: "Buy milk" })

            // And
            dsl.todo.completeTodo({ title: "Walk dog" })

            // Then
            dsl.todo.confirmTodoHasStatus({
                title: "Buy milk",
                status: "completed"
            })

            // And
            dsl.todo.confirmTodoHasStatus({
                title: "Walk dog",
                status: "completed"
            })
        })
    })
})

describe("Epic: View Todos", () => {
    describe("Feature: View todo lists", () => {
        it("should view all todos", () => {
            // Given
            dsl.user.createUser({ name: "Alice" })

            // And
            dsl.todo.createTodo({ owner: "Alice", title: "Buy milk" })
            dsl.todo.confirmTodoHasStatus({
                title: "Buy milk",
                status: "pending"
            })

            // And
            dsl.todo.createTodo({ owner: "Alice", title: "Walk dog" })
            dsl.todo.completeTodo({ title: "Walk dog" })
            dsl.todo.confirmTodoHasStatus({
                title: "Walk dog",
                status: "completed"
            })

            // When
            // (user views all todos - implicit query)

            // Then
            dsl.todo.confirmUserHasTodoCount({ owner: "Alice", count: 2 })
        })

        it("should view only pending todos", () => {
            // Given
            dsl.user.createUser({ name: "Alice" })

            // And
            dsl.todo.createTodo({ owner: "Alice", title: "Buy milk" })
            dsl.todo.confirmTodoHasStatus({
                title: "Buy milk",
                status: "pending"
            })

            // And
            dsl.todo.createTodo({ owner: "Alice", title: "Walk dog" })
            dsl.todo.completeTodo({ title: "Walk dog" })
            dsl.todo.confirmTodoHasStatus({
                title: "Walk dog",
                status: "completed"
            })

            // When
            // (user views pending todos)

            // Then
            dsl.todo.confirmUserSeesPendingTodo({
                owner: "Alice",
                title: "Buy milk"
            })
        })

        it("should have separate todo lists for different users", () => {
            // Given
            dsl.user.createUser({ name: "Alice" })

            // And
            dsl.user.createUser({ name: "Bob" })

            // And
            dsl.todo.createTodo({ owner: "Alice", title: "Alice's task" })

            // And
            dsl.todo.createTodo({ owner: "Bob", title: "Bob's task" })

            // When
            // (user Alice views their todos)

            // Then
            dsl.todo.confirmUserSeesPendingTodo({
                owner: "Alice",
                title: "Alice's task"
            })

            // And
            dsl.todo.confirmUserDoesNotSeeTodo({
                owner: "Alice",
                title: "Bob's task"
            })
        })
    })
})
