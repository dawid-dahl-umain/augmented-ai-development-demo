# Test Isolation Utilities: Understanding DslContext

## TL;DR - The Quick Answer

> **Q:** "Since I do `new Dsl(driver)` in every test, and inside we create a `new DslContext()`, how can all instances share the same static `globalSequenceNumbers` map?"

**A:** The `static` keyword makes `globalSequenceNumbers` belong to the **class itself**, not to instances. Every `new DslContext()` creates fresh instance properties (isolated) but all instances access the same static property (shared). It doesn't matter how many times or where you write `new DslContext()` - there's always ONE static map in memory.

**In practice:**

- Many `new Dsl()` → Many `new DslContext()` → All share ONE static counter
- This gives you functional isolation (tests don't interfere) AND temporal isolation (tests are repeatable)

**Read on for the complete explanation...**

## Table of Contents

- [Part 1: The Foundation - Understanding `static`](#part-1-the-foundation---understanding-static)
- [Part 2: How DslContext Uses Static Properties](#part-2-how-dslcontext-uses-static-properties)
- [Part 3: Why This Design? (Dave Farley's Three Isolations)](#part-3-why-this-design-dave-farleys-three-isolations)
- [Part 4: Your Architecture in Action](#part-4-your-architecture-in-action)
- [Part 5: Multi-Process Worker Isolation](#part-5-multi-process-worker-isolation)
- [Part 6: Real-World Analogy](#part-6-real-world-analogy)
- [Summary & Key Takeaways](#summary--key-takeaways)
- [Verification](#verification)
- [Under the Hood (Memory Mechanics)](#under-the-hood-memory-mechanics) ⭐ Optional deep dive

## Part 1: The Foundation - Understanding `static`

### What Does `static` Mean?

In TypeScript/JavaScript, `static` means "**this belongs to the class itself, not to instances of the class**."

Think of it like a classroom:

- **Static property** = The whiteboard on the wall (one per classroom, everyone shares it)
- **Instance property** = Each student's notebook (one per student, personal)

### The Critical Insight

```typescript
class Example {
  private static sharedData = 0 // ← ONE copy in memory (belongs to CLASS)
  private instanceData = 0 // ← Each instance gets its own copy
}

const obj1 = new Example() // Creates instance with its own instanceData
const obj2 = new Example() // Creates another instance with its own instanceData
const obj3 = new Example() // Creates another instance with its own instanceData

// But ALL three instances share the SAME sharedData
```

**Key point:** It doesn't matter if you write `new Example()` once or a million times. The `static sharedData` is created **once** when the class is loaded, and **all instances share it**.

### Visual: Static vs Instance Properties

```
┌─────────────────────────────────────────────────┐
│        Example CLASS (loaded once)              │
│                                                 │
│   static sharedData = 0      ← ONE copy        │
│                                                 │
└─────────────────────────────────────────────────┘
                    ↑
                    │ All instances access this
        ┌───────────┼──────────┐
        │           │          │
┌───────▼────┐  ┌───▼──────┐  ┌───▼──────┐
│ Instance 1 │  │ Instance 2│  │ Instance 3│
│            │  │           │  │           │
│ instance   │  │ instance  │  │ instance  │
│ Data = 0   │  │ Data = 0  │  │ Data = 0  │
│ (isolated) │  │ (isolated)│  │ (isolated)│
└────────────┘  └───────────┘  └───────────┘
```

### Common Misconception Addressed

❌ **WRONG:** "We have ONE static property because we only create instances in one place"

✅ **RIGHT:** "We have ONE static property because `static` makes it belong to the class, not instances"

You could create instances in 100 different files:

```typescript
// file1.ts
const ctx1 = new DslContext()

// file2.ts
const ctx2 = new DslContext()

// file3.ts
const ctx3 = new DslContext()

// test.ts
const ctx4 = new DslContext()
```

**There is STILL only ONE static `globalSequenceNumbers` map in memory.** The number and location of instantiation points is irrelevant.

## Part 2: How DslContext Uses Static Properties

### The Answer to Your Question

When you write `new Dsl(driver)` in every test, which internally creates `new DslContext()`, here's what happens:

**What's created fresh (isolated per test):**

- New `Dsl` instance
- New `DslContext` instance
- New `aliases` map (instance property)
- New `sequenceNumbers` map (instance property)

**What's shared (same across all tests):**

- The `static globalSequenceNumbers` map (class property)

So yes: **Many new Dsl → Many new DslContext → All share ONE static map.**

### The Design

```typescript
export class DslContext {
  // ONE copy shared across ALL instances in the process
  private static readonly globalSequenceNumbers = new Map<string, number>()

  // Each instance gets its own copies of these
  private readonly sequenceNumbers = new Map<string, number>()
  private readonly aliases = new Map<string, string>()

  public alias(name: string): string {
    // 1. Check if THIS instance already aliased this name
    const existing = this.aliases.get(name)
    if (existing) {
      return existing // Return cached value
    }

    // 2. Get next sequence number from SHARED static map
    const current = DslContext.globalSequenceNumbers.get(name) ?? 1
    DslContext.globalSequenceNumbers.set(name, current + 1)

    // 3. Create unique alias and cache in THIS instance
    const aliased = `${name}${current}`
    this.aliases.set(name, aliased)

    return aliased
  }
}
```

### Step-by-Step Example

Let's trace what happens when three tests run:

```typescript
// Test 1 starts
const context1 = new DslContext()
context1.alias("Acme Corp")
// Static map: { "Acme Corp" → 1 } becomes { "Acme Corp" → 2 }
// Instance map: { "Acme Corp" → "Acme Corp1" }
// Returns: "Acme Corp1"

// Test 2 starts (NEW instance)
const context2 = new DslContext()
context2.alias("Acme Corp")
// Static map: { "Acme Corp" → 2 } becomes { "Acme Corp" → 3 }
// Instance map: { "Acme Corp" → "Acme Corp2" }
// Returns: "Acme Corp2"  ← Different suffix!

// Test 3 starts (NEW instance)
const context3 = new DslContext()
context3.alias("Acme Corp")
// Static map: { "Acme Corp" → 3 } becomes { "Acme Corp" → 4 }
// Instance map: { "Acme Corp" → "Acme Corp3" }
// Returns: "Acme Corp3"  ← Counter keeps going!

// Within Test 1, calling again
context1.alias("Acme Corp")
// Returns: "Acme Corp1"  ← Cached from instance map, consistent!
```

### Visual: Memory State During Test Execution

```
┌──────────────────────────────────────────────────────┐
│         DslContext CLASS (in memory)                 │
│                                                      │
│  static globalSequenceNumbers = Map {               │
│    "Acme Corp" → 4    ← Accumulates across tests   │
│    "Globex" → 2                                     │
│  }                                                   │
└──────────────────────────────────────────────────────┘
                         ↑
                         │ All instances share this
        ┌────────────────┼────────────────┐
        │                │                │
┌───────▼──────┐  ┌──────▼─────┐  ┌──────▼─────┐
│ Test 1       │  │ Test 2      │  │ Test 3     │
│ context1     │  │ context2    │  │ context3   │
│              │  │             │  │            │
│ aliases: {   │  │ aliases: {  │  │ aliases: { │
│   "Acme      │  │   "Acme     │  │   "Acme    │
│   Corp" →    │  │   Corp" →   │  │   Corp" →  │
│   "Acme      │  │   "Acme     │  │   "Acme    │
│   Corp1"     │  │   Corp2"    │  │   Corp3"   │
│ }            │  │ }           │  │ }          │
└──────────────┘  └─────────────┘  └────────────┘
```

## Part 3: Why This Design? (Dave Farley's Three Isolations)

Dave Farley identified three levels of isolation needed for reliable, fast acceptance tests:

### 1. System-Level Isolation

**What:** Test at your system boundary, stub only external third-party dependencies.

**Implementation:** Handled by Protocol Driver layer (separate from DslContext).

- ✅ Use real database, cache, internal services (they're part of your system)
- ✅ Stub external APIs you don't control (payment gateways, email services)

### 2. Functional Isolation (Parallel Safety)

**What:** Tests can run in parallel without interfering with each other.

**How DslContext achieves this:**

Each test gets a fresh `DslContext` instance with its own `aliases` map. Tests don't share instance state.

```typescript
// Test A (running in parallel)
beforeEach(() => {
  dsl = new Dsl(driver) // Creates context1
})
it("test A", async () => {
  await dsl.clients.createClient({ name: "Acme Corp" }) // "Acme Corp1"
  await dsl.clients.createClient({ name: "Acme Corp" }) // "Acme Corp1" (cached)
})

// Test B (running in parallel)
beforeEach(() => {
  dsl = new Dsl(driver) // Creates context2
})
it("test B", async () => {
  await dsl.clients.createClient({ name: "Acme Corp" }) // "Acme Corp2"
  // Different test → different context → different data
})
```

The tests create different clients in the database: `"Acme Corp1"` and `"Acme Corp2"`. No collision.

### 3. Temporal Isolation (Repeatability)

**What:** Same test can run multiple times with deterministic results.

**How DslContext achieves this:**

The **static** `globalSequenceNumbers` provides an ever-incrementing counter. Running the same test again produces different aliases.

```typescript
// Within a single test run (one `pnpm test:acceptance` execution)
Test 1: "Acme Corp1"
Test 2: "Acme Corp2"  // Counter continues
Test 3: "Acme Corp3"  // Still accumulating

// Between test runs (separate Node process executions)
First run:  "Acme Corp1", "Acme Corp2", "Acme Corp3"
Second run: "Acme Corp1", "Acme Corp2", "Acme Corp3"  // Counter resets (fresh process memory)
```

**Why this matters:**

Within a test run:

- Static counter accumulates: 1, 2, 3...
- Database accumulates: Data from all tests persists simultaneously
- No collisions because each test gets unique identifiers

Between test runs:

- Static counter resets (Node process terminates, OS reclaims memory)
- Database cleanup is separate (handled by `beforeAll`/test containers)
- Both concerns are independent

## Part 4: Your Architecture in Action

### How Tests Use DslContext

```typescript
// clients.spec.ts
describe('Clients Acceptance', () => {
  let dsl: Dsl

  beforeEach(async () => {
    const driver = createProtocolDriver(...)
    dsl = new Dsl(driver)  // ← Creates fresh DslContext per test
  })

  it('should view the clients list', async () => {
    await dsl.clients.createClient({ name: 'Acme Corp' })
    // Context.alias('Acme Corp') → "Acme Corp1"

    await dsl.clients.createClient({ name: 'Globex' })
    // Context.alias('Globex') → "Globex1"

    await dsl.clients.viewClients()
    await dsl.clients.confirmClientsExist(['Acme Corp', 'Globex'])
    // Both clients exist with unique names in database
  })
})
```

### The DSL Layer Wiring

```typescript
// dsl/index.ts
export class Dsl {
  public readonly clients: ClientsDsl
  public readonly projects: ProjectsDsl
  public readonly offerings: OfferingsDsl

  constructor(driver: ProtocolDriver) {
    const context = new DslContext(vitestWorkerIdProvider)

    // All domain DSLs share THIS context instance
    this.clients = new ClientsDsl(context, driver)
    this.projects = new ProjectsDsl(context, driver, this.clients)
    this.offerings = new OfferingsDsl(context, driver, ...)
  }
}
```

**Why share one context instance across DSL classes?**

Within a single test, you want `dsl.clients.createClient({ name: 'Acme Corp' })` and `dsl.projects.createProject({ client: 'Acme Corp', ... })` to reference the **same** aliased client (`"Acme Corp1"`).

Sharing the context instance ensures:

- `dsl.clients.findClient('Acme Corp')` → `"Acme Corp1"`
- `dsl.projects` references same client → `"Acme Corp1"`

It's about **within-test consistency**, while the static map provides **cross-test uniqueness**.

### What Happens in Practice

```
Test 1 (clients.spec.ts)
  ├─ new Dsl(driver)
  ├─ new DslContext() → instance1
  ├─ createClient('Acme Corp') → "Acme Corp1" in DB
  └─ static map: { "Acme Corp" → 2 }

Test 2 (clients.spec.ts)
  ├─ new Dsl(driver)
  ├─ new DslContext() → instance2
  ├─ createClient('Acme Corp') → "Acme Corp2" in DB
  └─ static map: { "Acme Corp" → 3 }

Test 3 (offering.spec.ts)
  ├─ new Dsl(driver)
  ├─ new DslContext() → instance3
  ├─ createClient('Acme Corp') → "Acme Corp3" in DB
  └─ static map: { "Acme Corp" → 4 }

Database after run: [
  { name: "Acme Corp1", ... },
  { name: "Acme Corp2", ... },
  { name: "Acme Corp3", ... }
]
```

All clients exist simultaneously without collision.

## Part 5: Multi-Process Worker Isolation

### The Challenge

Vitest runs test files in **separate OS processes** when using parallel mode. Each process has its own memory space, so the static `globalSequenceNumbers` map is **not shared across processes**.

```
┌─────────────────────┐    ┌─────────────────────┐
│  Worker Process 1   │    │  Worker Process 2   │
│  (clients.spec.ts)  │    │ (offering.spec.ts)  │
│                     │    │                     │
│  DslContext CLASS   │    │  DslContext CLASS   │
│  static map {       │    │  static map {       │
│    "Acme" → 2       │    │    "Acme" → 2       │
│  }                  │    │  }                  │
│  ↓                  │    │  ↓                  │
│  "Acme1" in DB      │    │  "Acme1" in DB      │
└─────────────────────┘    └─────────────────────┘
            ↓                         ↓
         COLLISION! Both create "Acme Corp1"
```

### The Solution: Worker ID Namespacing

```typescript
export class DslContext {
  private static readonly globalSequenceNumbers = new Map<string, number>()
  private readonly workerId: string | null

  constructor(workerIdOrProvider?: string | WorkerIdProvider) {
    if (typeof workerIdOrProvider === "function") {
      this.workerId = workerIdOrProvider() // e.g., "1", "2", "3"
    } else {
      this.workerId = workerIdOrProvider ?? null
    }
  }

  private recordAlias = (name: string): string => {
    // Namespace the key by worker ID
    const namespacedKey = this.workerId
      ? `${this.workerId}:${name}` // "1:Acme Corp", "2:Acme Corp"
      : name

    // Use namespaced key in static map
    const sequenceNo = this.seqForName(
      namespacedKey,
      1,
      DslContext.globalSequenceNumbers
    )

    // Include worker ID in the final alias
    const value = this.workerId
      ? `${name}-w${this.workerId}-${sequenceNo}` // "Acme Corp-w1-1"
      : `${name}${sequenceNo}` // "Acme Corp1"

    this.aliases.set(name, value)
    return value
  }
}
```

### Worker ID Provider

```typescript
// worker-id-provider.ts
export const vitestWorkerIdProvider: WorkerIdProvider = () =>
  process.env.VITEST_POOL_ID ?? process.pid.toString()
```

Vitest sets `VITEST_POOL_ID` to "1", "2", "3", etc. for each worker process.

### Result: No Collisions

```
┌─────────────────────────┐    ┌─────────────────────────┐
│  Worker Process 1       │    │  Worker Process 2       │
│  (clients.spec.ts)      │    │  (offering.spec.ts)     │
│                         │    │                         │
│  DslContext CLASS       │    │  DslContext CLASS       │
│  static map {           │    │  static map {           │
│    "1:Acme" → 2         │    │    "2:Acme" → 2         │
│  }                      │    │  }                      │
│  ↓                      │    │  ↓                      │
│  "Acme-w1-1" in DB      │    │  "Acme-w2-1" in DB      │
└─────────────────────────┘    └─────────────────────────┘
            ↓                            ↓
         No collision! Different names in database
```

## Part 6: Real-World Analogy

Think of a **ticket machine at a bakery**:

### The Ticket Machine (Static Property)

- There's **ONE machine** in the bakery (like one static `globalSequenceNumbers`)
- Everyone who enters presses the button on this **same machine**
- The machine's internal counter keeps incrementing: 1, 2, 3, 4...

### Your Ticket (Instance Property)

- When you press the button, you get **YOUR ticket** (like your instance's `aliases` map)
- You hold **your ticket** (#42) until you're served
- Your ticket is **yours alone** - no one else has #42

### Multiple Visits (Multiple Instances)

- You visit the bakery tomorrow and press the button again
- The machine doesn't reset - it's now at #156
- You get a **new ticket** (#156), different from yesterday's (#42)
- The machine (static) persists, but each visit gives you a fresh ticket (instance)

### Multiple Locations (Worker Processes)

If the bakery chain has multiple locations with separate ticket machines, they add location prefixes:

- Location 1: "Downtown-#42", "Downtown-#43"
- Location 2: "Uptown-#42", "Uptown-#43"

No collision between locations (like worker IDs prevent cross-process collisions).

## Summary & Key Takeaways

### Core Principles

1. **`static` means "one copy for the class"**, not "one copy per instance"
2. **Location of instantiation is irrelevant** - you can create instances anywhere, anytime
3. **Creating `new DslContext()` doesn't reset the static map** - it just creates a new instance
4. **Each test gets isolated instance state** (aliases map) for functional isolation
5. **All tests share the counter** (globalSequenceNumbers) for temporal isolation

### The Pattern's Brilliance

Dave Farley's pattern uses **both** instance and static properties to achieve:

- **Instance properties** → Functional isolation (tests don't interfere)
- **Static properties** → Temporal isolation (tests are repeatable)
- **Protocol driver** → System-level isolation (stub only external dependencies)

### Your Implementation

Your TypeScript/Vitest implementation:

- ✅ Faithfully mirrors Dave Farley's Java pattern
- ✅ Extends it with worker ID namespacing for multi-process safety
- ✅ Maintains clean separation: one context per test, shared across DSL classes

### Mental Model

```
Class Definition (loaded once)
  └─> Static properties (one copy, shared by all)
       ↑
       └─ Instance 1 (test 1)
       └─ Instance 2 (test 2)
       └─ Instance 3 (test 3)
       └─ ... (all point to same static)
```

## Verification

### In Your Console

**Within a single test run:**

```bash
pnpm test:acceptance
# Static counter: 1 → 2 → 3 (accumulates during run)
# Database after: "Acme Corp1", "Acme Corp2", "Acme Corp3" (all persist)
```

**Between separate test runs:**

```bash
# First execution
pnpm test:acceptance
# Counter: 1, 2, 3
# Database: "Acme Corp1", "Acme Corp2", "Acme Corp3"

# Second execution (new Node process)
pnpm test:acceptance
# Counter: 1, 2, 3 (resets - fresh process memory)
# Database: depends on cleanup strategy (beforeAll clear OR fresh container)
```

**Key insight:** The static counter is process-bound (resets when Node process terminates), while database cleanup is handled separately by your test infrastructure.

## Under the Hood (Memory Mechanics)

**⏱️ 5 min read** | **Optional deep dive** - Skip if you're satisfied with the conceptual explanation

This section explains the actual memory allocation and lifecycle for readers who want to understand the implementation details.

### When Is It Created?

The static map is created during **module loading**, before any test code runs:

```typescript
// When Node.js executes: import { DslContext } from './DslContext'

// 1. Node.js loads the module file
// 2. Parses the class definition
// 3. Evaluates static property initializers → new Map<string, number>()
// 4. Allocates heap memory for the Map object
// 5. Stores reference in DslContext.globalSequenceNumbers
```

**Timeline:**

```
T=0: pnpm test:acceptance starts Node.js process
T=1: Module loader reads DslContext.ts
T=2: Static initializer runs → Map created in heap (e.g., address 0x7f8a4c2000a0)
T=3: Your test code starts running
T=4-999: Tests create instances, all access the same Map at 0x7f8a4c2000a0
T=1000: Process exits → OS reclaims all memory
```

### Where Does It Live?

Static properties live in the **heap** (same as regular objects), referenced by the class object:

```
HEAP MEMORY:
┌─────────────────────────────────────┐
│  DslContext (class object)          │
│  └─ globalSequenceNumbers → [ref]  │ ← Held by module system
│                               │      │
│                               ▼      │
│  Map object { entries: [...] }      │ ← The actual static map
│                                      │
│  Instance 1 { aliases: {...} }      │ ← Test 1 instance
│  Instance 2 { aliases: {...} }      │ ← Test 2 instance
└─────────────────────────────────────┘

All instances can access the Map via DslContext.globalSequenceNumbers
```

### Why Isn't It Garbage Collected?

JavaScript's garbage collector traces references from "roots" (global scope, active stack frames, **module system**):

```
Root References:
  └─ Module System (always alive)
      └─ DslContext class object
          └─ globalSequenceNumbers
              └─ Map object

Result: Always reachable → Never garbage collected during test run
```

**Contrast with instance properties:**

```typescript
{
  const ctx = new DslContext() // Instance created
  // ctx.aliases is reachable via 'ctx'
}
// ctx goes out of scope → instance becomes unreachable → garbage collected
// But DslContext.globalSequenceNumbers is still reachable via module system
```

### When Is It Freed?

**Only when the Node.js process terminates:**

```
Process Lifecycle:
┌────────────────────────────────────────┐
│ $ pnpm test:acceptance                 │
│   └─ Node.js PID 12345                 │
│       └─ Memory: 150 MB                │
│           └─ Static map lives here     │
│                                        │
│ Tests run... counter accumulates...    │
│                                        │
│ process.exit(0)                        │
│   └─ OS reclaims ALL 150 MB           │
│       └─ Static map is GONE            │
└────────────────────────────────────────┘

Next run: $ pnpm test:acceptance
  └─ New process (PID 12389)
      └─ New memory space
          └─ NEW static map (fresh counter)
```

The operating system doesn't selectively free objects - it reclaims the entire process memory space when the process terminates.

### Why This Matters

**Within a test run:**

- Static map persists (counter accumulates: 1, 2, 3...)
- Guarantees unique identifiers across all tests

**Between test runs:**

- New Node.js process = new memory space
- Static map is recreated fresh (counter resets to start from 1)
- Predictable, repeatable behavior

**Process boundaries:**

- Vitest workers = separate OS processes
- Each has its own memory space and static map
- Worker ID namespacing prevents collisions
