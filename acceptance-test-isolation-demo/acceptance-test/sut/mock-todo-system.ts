export type TodoStatus = "pending" | "completed"

export type User = {
    name: string
}

export type Todo = {
    id: string
    title: string
    description: string
    owner: string
    status: TodoStatus
}

export class MockTodoSystem {
    private users = new Map<string, User>()
    private todos = new Map<string, Todo>()
    private userTodos = new Map<string, Set<string>>()

    public createUser(name: string): User {
        const user: User = { name }
        this.users.set(name, user)
        return user
    }

    public getUser(name: string): User | undefined {
        return this.users.get(name)
    }

    public userExists(name: string): boolean {
        return this.users.has(name)
    }

    public createTodo(
        id: string,
        title: string,
        description: string,
        owner: string
    ): Todo {
        const todo: Todo = {
            id,
            title,
            description,
            owner,
            status: "pending"
        }

        this.todos.set(title, todo)

        if (!this.userTodos.has(owner)) {
            this.userTodos.set(owner, new Set())
        }
        this.userTodos.get(owner)!.add(title)

        return todo
    }

    public getTodo(title: string): Todo | undefined {
        return this.todos.get(title)
    }

    public completeTodo(title: string): void {
        const todo = this.todos.get(title)
        if (todo) {
            todo.status = "completed"
        }
    }

    public getUserTodos(owner: string): Todo[] {
        const todoTitles = this.userTodos.get(owner)
        if (!todoTitles) {
            return []
        }

        return Array.from(todoTitles)
            .map(title => this.todos.get(title))
            .filter((todo): todo is Todo => todo !== undefined)
    }

    public getPendingTodos(owner: string): Todo[] {
        return this.getUserTodos(owner).filter(
            todo => todo.status === "pending"
        )
    }

    public getCompletedTodos(owner: string): Todo[] {
        return this.getUserTodos(owner).filter(
            todo => todo.status === "completed"
        )
    }
}
