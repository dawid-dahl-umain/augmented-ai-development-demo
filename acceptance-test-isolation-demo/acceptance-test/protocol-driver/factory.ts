import type { ProtocolDriver } from "./interface"
import { MockDriver } from "./mock-driver"
import { MockTodoSystem } from "../sut"

export const createProtocolDriver = (): ProtocolDriver => {
    const sut = new MockTodoSystem()
    return new MockDriver(sut)
}
