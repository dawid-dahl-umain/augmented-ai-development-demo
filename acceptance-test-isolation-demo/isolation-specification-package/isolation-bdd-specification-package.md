# Simple Todo App - BDD Specification Package

## Project Overview

A personal todo application where users can create and manage their own todos. This is a demonstration system for illustrating test isolation techniques in acceptance testing.

## Ubiquitous Language

-   **User**: A person with their own todo list
-   **Todo**: An item to be completed, with a title and optional description
-   **Status**: Current state of a todo (pending or completed)
-   **Todo List**: Collection of todos belonging to a specific user

---

## Epic 1: User Setup

### Title: Create user with todo list

**User Story:**  
As a new user, I want to have my own todo list, so that I can track my personal tasks.

**Acceptance Criteria:**

#### Feature: Create user with todo list

##### Scenario: Create user

> **Given** no user exists with name "Alice"  
> **When** user "Alice" is created  
> **Then** user "Alice" should exist  
> **And** user "Alice" should have an empty todo list

---

## Epic 2: Todo Creation

### Title: Create todos

**User Story:**  
As a user, I want to create todos, so that I can track things I need to do.

**Acceptance Criteria:**

#### Feature: Create todos

##### Scenario: Create todo with title only

> **Given** user "Alice" exists  
> **When** user "Alice" creates todo "Buy milk"  
> **Then** todo "Buy milk" should exist  
> **And** todo "Buy milk" should belong to user "Alice"  
> **And** todo "Buy milk" should have status "pending"  
> **And** todo "Buy milk" should have an empty description

##### Scenario: Create todo with title and description

> **Given** user "Alice" exists  
> **When** user "Alice" creates todo "Buy milk" with description "Get 2% milk"  
> **Then** todo "Buy milk" should exist with description "Get 2% milk"  
> **And** todo "Buy milk" should belong to user "Alice"

##### Scenario: Create multiple todos for same user

> **Given** user "Alice" exists  
> **When** user "Alice" creates todo "Buy milk"  
> **And** user "Alice" creates todo "Walk dog"  
> **And** user "Alice" creates todo "Read book"  
> **Then** user "Alice" should have 3 todos

---

## Epic 3: Todo Completion

### Title: Complete todos

**User Story:**  
As a user, I want to mark todos as completed, so that I can track my progress.

**Acceptance Criteria:**

#### Feature: Complete todos

##### Scenario: Complete a pending todo

> **Given** user "Alice" exists  
> **And** user "Alice" has todo "Buy milk" with status "pending"  
> **When** user "Alice" completes todo "Buy milk"  
> **Then** todo "Buy milk" should have status "completed"

##### Scenario: Complete multiple todos

> **Given** user "Alice" exists  
> **And** user "Alice" has todo "Buy milk"  
> **And** user "Alice" has todo "Walk dog"  
> **When** user "Alice" completes todo "Buy milk"  
> **And** user "Alice" completes todo "Walk dog"  
> **Then** todo "Buy milk" should have status "completed"  
> **And** todo "Walk dog" should have status "completed"

---

## Epic 4: View Todos

### Title: View todo lists

**User Story:**  
As a user, I want to view my todos, so that I can see what I need to do.

**Acceptance Criteria:**

#### Feature: View todo lists

##### Scenario: View all todos

> **Given** user "Alice" exists  
> **And** user "Alice" has todo "Buy milk" with status "pending"  
> **And** user "Alice" has todo "Walk dog" with status "completed"  
> **When** user "Alice" views all todos  
> **Then** user "Alice" should see 2 todos

##### Scenario: View only pending todos

> **Given** user "Alice" exists  
> **And** user "Alice" has todo "Buy milk" with status "pending"  
> **And** user "Alice" has todo "Walk dog" with status "completed"  
> **When** user "Alice" views pending todos  
> **Then** user "Alice" should see only todo "Buy milk"

##### Scenario: Users have separate todo lists

> **Given** user "Alice" exists  
> **And** user "Bob" exists  
> **And** user "Alice" has todo "Alice's task"  
> **And** user "Bob" has todo "Bob's task"  
> **When** user "Alice" views their todos  
> **Then** user "Alice" should see only "Alice's task"  
> **And** user "Alice" should not see "Bob's task"

---

## Implementation Notes

-   The domain is implementation-agnostic
-   User names and todo titles will be handled by test infrastructure to ensure isolation
-   Tests should be able to run repeatedly without cleanup
-   Tests should be able to run in parallel without interference
-   The system under test will be a minimal mock implementation using pure functions

## Out of Scope (for this demo)

-   Todo priorities, due dates, or categories
-   Todo deletion or archiving
-   Sharing todos between users
-   Authentication/authorization
-   Persistence layer details
-   UI/API specification (protocol-agnostic)
-   Complex business rules
